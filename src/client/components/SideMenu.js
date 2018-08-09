import React from 'react';
import SideNav, {MenuIcon} from 'react-simple-sidenav';
import IcsLogo from './ics-logo.png';
import Stag from './stag.png';
import {Link} from 'react-router-dom';

class SideMenu extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state = {
            showNav: false
        }
    }

    getStyle() {
        let styles = {
          menuBar: {
            width: '100%',
            background: '#0AC',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            position: 'fixed',
            zIndex: 2,
            top: 0,
          },
          bg: {
            backgroundColor: '#073C72',
            fontSize: '24px'
          },
          menuIcon: {
            padding: 12,
            verticalAlign: 'middle',
          }
        }
        return styles;
    }

    render() {
        let styles = this.getStyle();
        return (
            <div style={{paddingTop: 60}}>
                <div style={Object.assign({}, styles.menuBar, styles.bg)}>
                <MenuIcon style={styles.menuIcon} onClick={()=>this.setState({showNav: true})}/>
                Multimodal Sensing Office Monitoring Front-End
                <a style={{margin: '10px 20px 10px auto'}} href='https://www.surrey.ac.uk/ics'>
                    <img width='600' src={IcsLogo}/>
                </a>
            </div>
            <SideNav
                showNav={this.state.showNav}
                onHideNav={()=>this.setState({showNav: false})} 
                title={<div><img src={Stag} width='20'/> Desk Monitor </div>}
                titleStyle={styles.bg}
                items={[
                    <Link to='/'>Home</Link> ,
                    <Link to='/dashboard'>DashBoard</Link> 
                ]}
            />
            </div>
        );
    }
};

export default SideMenu;
