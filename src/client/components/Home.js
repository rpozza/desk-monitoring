import React from 'react';
import {LineChart} from 'react-easy-chart';
import moment from 'moment';
import myconf from '../../../config.json';
import './Home.css';

class Home extends React.PureComponent{
    constructor(props) {
        super(props);
        this.turnOnMonitoring = this.turnOnMonitoring.bind(this);
        this.turnOffMonitoring = this.turnOffMonitoring.bind(this);

        this.updateData = this.updateData.bind(this);
        this.proximityDetector = this.proximityDetector.bind(this);
        
        this.handleResize = this.handleResize.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);

        const initialWidth = window.innerWidth > 0 ? window.innerWidth : 500;
        this.state = {
            sampleWindowSize: 60,
            sampleIntervalms: 1000,
            desk: '080',
            email: myconf.emailUser,
            maxTemperature: '30',
            maxHumidity: '55',
            maxLightIntensity: '1.0',
            maxDustConcentration: '0.4',
            showToolTip: false,
            windowWidth: initialWidth - 100,
            componentWidth: 300,
            componentMargin: 10,
            rowsScaling: 5,
            columnsScaling: 2
        };
        this.humidity = [
            this.initializationData(50)
        ];
        this.temperature = [
            this.initializationData(26)
        ];
        this.lightIntensity = [
            this.initializationData(80 / 1000)
        ];
        this.dustConcentration = [
            this.initializationData(0.25)
        ];
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({
            windowWidth: window.innerWidth - 100,
            componentWidth: this.refs.component.offsetWidth
        });
    }
    
    handleFormChange(evt){
        this.setState({ [evt.target.name]: evt.target.value});
    }

    initializationData(value) {
        const data = [];
        const xs = [];
    
        let ts = moment();
        for (let i = 1; i <= this.state.sampleWindowSize; i++) {
          xs.unshift(ts.format('HH:mm:ss'));
          ts = ts.subtract(1, 'seconds');
        }        
        xs.forEach((x) => {
            data.push({ x, y: value });
        });
        return data;
    }

    notifyUser (subject,body){
        fetch('/api/sendmail', {
            method: 'POST',
            headers :{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: this.state.email,
                sub: subject,
                mes: body
            })
        });
    }

    getLWM2MValue(path,outobject,scaling, maxParameter, mail){
        fetch('/api/clients/IoTEgg'+ this.state.desk + path)
            .then((res) => {
                if (res.ok){
                    return res.json(); 
                }
                throw new Error('LWM2M Server Status: ' + res.status);
            })
            .then((sample) => { 
                outobject.forEach((data) => {
                    data.shift();
                    let yval = sample.content.value / scaling; 
                    let ts = moment();
                    data.push({x:ts.format('HH:mm:ss'),y:yval})                        
                });
                let previousSample = outobject[0][8].y;
                let currentSample = outobject[0][9].y;
                let maxThreshold = Number(maxParameter); 
                if ((previousSample < maxThreshold) && (currentSample >= maxThreshold)){
                    this.notifyUser(mail.subject,mail.message);
                }
                return;
            })
            .catch((err)=>{
                console.log(err);
            });
    }

    turnOnMonitoring() {
        this.setState({ intervalID: setInterval(this.proximityDetector, this.state.sampleIntervalms) });
    }
    
    turnOffMonitoring() {
        clearInterval(this.state.intervalID);
        this.setState({ intervalID: null });
    }
    
    proximityDetector(){
        fetch('/api/clients/IoTEgg' + this.state.desk + '/3330/0/5700')
            .then((res) => {
                if (res.ok){
                    return res.json(); 
                }
                throw new Error('LWM2M Server Status: ' + res.status);
            })
            .then((sample) => {
                let distance = sample.content.value;
                if (distance >= 75){
                    //away do nothing
                }
                else{
                    //present do update
                    this.updateData();
                }
                return;
            })
            .catch((err)=>{
                console.log(err);
            });
    }

    updateData() {
        this.getLWM2MValue('/3304/0/5700',this.humidity,1, this.state.maxHumidity, {
            subject: "Excessive Room Humidity",
            message: "Open the Windows and/or Turn On Air Conditioning"
        });
        this.getLWM2MValue('/3303/0/5700',this.temperature,1, this.state.maxTemperature, {
            subject: "Excessive Room Temperature",
            message: "Drink Water and/or Turn On Air Conditioning"
        });
        this.getLWM2MValue('/3301/0/5700',this.lightIntensity,1000, this.state.maxLightIntensity, {
            subject: "Excessive Light Intensity",
            message: "Close Curtains"
        });
        this.getLWM2MValue('/3325/0/5700',this.dustConcentration,1, this.state.maxDustConcentration, {
                subject: "Excessive Dust Levels",
                message: "Open the Windows and/or Exit the Building"
        });
        this.forceUpdate();
    }

    render() {
        return (
                <div ref="component">
                    <h2> User Desk, User Preferences and User Notification Email</h2>
                
                    <form>
                        <label>Desk Number:   </label>
                        <input type="text" name="desk" value={this.state.desk} maxlength="3" size ="3" onChange={this.handleFormChange} />
                        <label>   Email Address:   </label>
                        <input type="text" name="email" value={this.state.email} onChange={this.handleFormChange} />
                    </form>
                
                    <p> </p>
                
                    <form>
                        <label>   Max Temperature:   </label>
                        <input type="text" name="maxTemperature" value={this.state.maxTemperature} maxlength="3" size ="3" onChange={this.handleFormChange} />
                        <label>   Max Humidity:   </label>
                        <input type="text" name="maxHumidity" value={this.state.maxHumidity} maxlength="3" size ="3" onChange={this.handleFormChange} />
                        <label>   Max Light Intensity:   </label>
                        <input type="text" name="maxLightIntensity" value={this.state.maxLightIntensity} maxlength="3" size ="3" onChange={this.handleFormChange} />
                        <label>   Max Dust Concentration:   </label>
                        <input type="text" name="maxDustConcentration" value={this.state.maxDustConcentration} maxlength="3" size ="3" onChange={this.handleFormChange} />
                    </form>

                    <p> </p>
                    {(this.state.intervalID)
                        ? <input type="button" value="Stop monitoring" onClick={this.turnOffMonitoring} />
                        : <input type="button" value="Start monitoring" onClick={this.turnOnMonitoring} />}
                                        
                    <div className="row">
                        <div className="column">
                            <LineChart
                                data={this.temperature}
                                datePattern={'%H:%M:%S'}
                                xType={'time'}
                                width={(this.state.componentWidth - this.state.componentMargin ) / this.state.columnsScaling }
                                height={this.state.componentWidth / this.state.rowsScaling}
                                interpolate={'cardinal'}
                                lineColors={['purple']}
                                yDomainRange={[16, 36]}
                                axes={(this.state.componentWidth) > 600 ? true : false}
                                axisLabels={{ x: 'Time', y: 'Temperature (°C)' }}
                                grid
                                style={{
                                    '.label': {fill: 'black'}
                                }}
                            />
                        </div>

                        <div className="column">
                            <LineChart
                                data={this.humidity}
                                datePattern={'%H:%M:%S'}
                                xType={'time'}
                                width={(this.state.componentWidth - this.state.componentMargin ) / this.state.columnsScaling }
                                height={this.state.componentWidth / this.state.rowsScaling}
                                interpolate={'cardinal'}
                                lineColors={['red']}
                                yDomainRange={[0, 100]}
                                axes={(this.state.componentWidth) > 600 ? true : false}
                                axisLabels={{ x: 'Time', y: 'Humidity (%)' }}
                                grid
                                style={{
                                    '.label': {fill: 'black'},
                                }}
                            />
                        </div>

                    </div>

                    <div className="row">
                        <div className="column">
                            <LineChart
                                data={this.lightIntensity}
                                datePattern={'%H:%M:%S'}
                                xType={'time'}
                                width={(this.state.componentWidth - this.state.componentMargin ) / this.state.columnsScaling }
                                height={this.state.componentWidth / this.state.rowsScaling}
                                interpolate={'cardinal'}
                                lineColors={['blue']}
                                yDomainRange={[0, 2]}
                                axes={(this.state.componentWidth) > 600 ? true : false}
                                axisLabels={{ x: 'Time', y: 'Light Intensity (mW/cm²)' }}
                                grid
                                style={{
                                    '.label': {fill: 'black'}
                                }}
                            />
                        </div>

                        <div className="column">
                            <LineChart
                                data={this.dustConcentration}
                                datePattern={'%H:%M:%S'}
                                xType={'time'}
                                width={(this.state.componentWidth - this.state.componentMargin ) / this.state.columnsScaling }
                                height={this.state.componentWidth / this.state.rowsScaling}
                                interpolate={'cardinal'}
                                lineColors={['green']}
                                yDomainRange={[0, 0.5]}
                                axes={(this.state.componentWidth) > 600 ? true : false}
                                axisLabels={{ x: 'Time', y: 'Dust Concentration (mg/mm³)' }}
                                grid
                                style={{
                                    '.label': {fill: 'black'}
                                }}
                            />
                        </div>

                    </div>
                </div>
        );
    }
};

export default Home;
