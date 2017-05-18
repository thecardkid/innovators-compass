'use strict';

import css from 'style-loader!css-loader!less-loader!./../public/css/app.less';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { MODES, PROMPTS } from '../utils/constants.js';

import CompassEdit from './CompassEdit.jsx';
import CompassView from './CompassView.jsx';
import LandingPage from './LandingPage.jsx';

class Index extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};
        this.socket = io();

        this.socket.on('compass ready', (data) => {
            this.setState({
                compass: data.compass,
                mode: data.mode,
                code:data.code,
                username: data.username
            }, () => browserHistory.push('/compass'));
        });

        this.socket.on('new compass', () => alert(PROMPTS.REMEMBER_CODE));
    }

    render() {
        return (
            <Router history={browserHistory}>
                <Route path='/' component={() => <LandingPage socket={this.socket} />}/>
                <Route path='/compass' component={() => {
                    if (this.state.mode === MODES.EDIT)
                        return <CompassEdit compass={this.state.compass} username={this.state.username}/>
                    else if (this.state.mode === MODES.VIEW) {
                        return <CompassView compass={this.state.compass}/>
                    }
                }}/>
            </Router>
        );
    }
}

$(window).ready(() => render(<Index/>, document.getElementById('container')));
