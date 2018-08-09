import React from 'react';
import myconf from '../../../config.json';

class DashBoard extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state =  {
            kibanaURL : myconf.kibanaURL
        };
    }

    render() {
        return (
            <div>
                <h2> DashBoard </h2>
                <iframe src={myconf.kibanaURL} height={window.innerHeight - 100} width={window.innerWidth-100}></iframe>
            </div>
        );
    }
};

export default DashBoard;
