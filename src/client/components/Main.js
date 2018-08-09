import React from 'react';
import {Switch,Route} from 'react-router-dom';
import Home from './Home';
import DashBoard from './DashBoard';

class Main extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Switch>
                <Route exact path='/' component={Home}/>
                <Route path='/dashboard' component={DashBoard}/>
            </Switch>
        );
    }
};

export default Main;
