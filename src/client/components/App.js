import React from 'react';
import SideMenu from './SideMenu';
import Main from './Main';

class App extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
            <SideMenu />
            <Main />
            </div>
        );
    }
};

export default App;