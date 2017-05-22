'use strict';

import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';

import Shared from 'Utils/Shared.jsx';
import Socket from 'Utils/Socket.jsx';
import Validator from 'Utils/Validator.jsx';

import { ERROR_MSG } from 'Lib/constants.js';

const LOGIN_TYPE = {
    MAKE: 0,
    FIND: 1
};

export default class LandingPage extends Component {

    constructor(props, context) {
        super(props, context);

        this.socket = new Socket(this);
        this.state = {loginType: null, vw: window.innerWidth, vh: window.innerHeight};

        this.center = Shared.center.bind(this);
        this.setLoginType = this.setLoginType.bind(this);
        this.getFirst = this.getFirst.bind(this);
        this.getSecond = this.getSecond.bind(this);
        this.getThird = this.getThird.bind(this);
        this.validateFindInput = this.validateFindInput.bind(this);
        this.validateMakeInput = this.validateMakeInput.bind(this);
        this.toWorkspace = this.toWorkspace.bind(this);
        this.updateWindowSize = this.updateWindowSize.bind(this);
        this.getMakeSuccessNotification = this.getMakeSuccessNotification.bind(this);
        this.getFindSuccessNotification = this.getFindSuccessNotification.bind(this);
    }

    componentDidMount() {
        $(window).on('resize', this.updateWindowSize);
    }

    componentWillUnmount() {
        $(window).off('resize', this.updateWindowSize);
    }

    updateWindowSize() {
        this.setState({vw: window.innerWidth, vh: window.innerHeight});
    }

    setLoginType(type) {
        $('#compass-center').val('');
        $('#compass-code').val('');
        $('#username').val('');
        this.setState({data: null, loginType: type});
    }

    validateFindInput() {
        $('#error-message').text('');
        let code = Validator.validateCompassCode($('#compass-code').val());
        let username = Validator.validateUsername($('#username').val());

        if (!code[0]) return $('#error-message').text(code[1]);
        if (!username[0]) return $('#error-message').text(username[1]);

        this.setState({username: username[1]});
        this.socket.emitFindCompass(code[1], username[1]);
    }

    validateMakeInput() {
        $('#error-message').text('');
        let center = Validator.validateCenter($('#compass-center').val());
        let username = Validator.validateUsername($('#username').val());

        if (!center[0]) return $('#error-message').text(center[1]);
        if (!username[0]) return $('#error-message').text(username[1]);

        this.setState({username: username[1]});
        this.socket.emitCreateCompass(center[1], username[1]);
    }

    getFirst() {
        return (
            <div className="section">
                <h1>Are you finding or making a compass?</h1>
                <button className="ic-button" name="find" onClick={() => this.setLoginType(LOGIN_TYPE.FIND)}>finding</button>
                <button className="ic-button" name="make" onClick={() => this.setLoginType(LOGIN_TYPE.MAKE)}>making</button>
            </div>
        );
    }

    getSecond() {
        if (typeof this.state.loginType !== 'number') return;

        let firstPrompt, inputId, cb;

        if (this.state.loginType === LOGIN_TYPE.FIND) {
            firstPrompt = 'What is the code you were given?';
            inputId = 'compass-code';
            cb = this.validateFindInput;
        } else {
            firstPrompt = 'Who are the PEOPLE involved, at the center of your compass?';
            inputId = 'compass-center';
            cb = this.validateMakeInput;
        }

        return (
            <div className="section">
                <h1>I need some info</h1>
                <div className="prompt">{firstPrompt}</div>
                <div className="response"><input id={inputId} /></div>
                <div className="prompt">Your name (how others will see you)</div>
                <div className="response"><input id="username" /></div>
                <div id="error-message"></div>
                <button className="ic-button" name="next" onClick={cb}>next</button>
            </div>
        );
    }

    getNullNotification() {
        return (
            <div className="section third">
                <h1>Sorry!</h1>
                <h2>I couldn&apos;t find your compass. Do you have the right code?</h2>
            </div>
        );
    }

    toWorkspace() {
        let email = $('#email').val();
        let valid = Validator.validateEmail(email);
        let d = this.state.data;

        if (email && !valid[0]) return alert(ERROR_MSG.INVALID('Email'));

        if (email && valid[0]) this.socket.emitSendMail(d.code, this.state.username, email);

        switch(this.state.loginType) {
        case LOGIN_TYPE.MAKE:
            return browserHistory.push('/compass/edit/'+d.code+'/'+this.state.username);
        case LOGIN_TYPE.FIND:
            return browserHistory.push('/compass/'+d.mode+'/'+d.code+'/'+this.state.username);
        }
    }

    getMakeSuccessNotification(code) {
        return (
            <div className="section third">
                <h1>{code}</h1>
                <h2>This is your compass code. If you would like to email me this to you, enter your email below. Your email will not be saved.</h2>
                <input id="email" type="text" />
                <button className="ic-button" name="to-workspace" onClick={this.toWorkspace}>let&apos;s go</button>
            </div>
        );
    }

    getFindSuccessNotification(mode) {
        return (
            <div className="section third">
                <h1>{mode} access</h1>
                <h2>You will be logged in as {this.state.username}</h2>
                <button className="ic-button" name="to-workspace" onClick={this.toWorkspace}>to workspace</button>
            </div>
        );
    }

    getThird() {
        if (typeof this.state.data !== 'object' || this.state.data === null) return;

        if (!this.state.data.success)
            return this.getNullNotification();

        if (this.state.loginType === LOGIN_TYPE.MAKE)
            return this.getMakeSuccessNotification(this.state.data.code);

        if (this.state.loginType === LOGIN_TYPE.FIND)
            return this.getFindSuccessNotification(this.state.data.mode);
    }

    render() {
        return (
            <div id="ic-landing" style={this.center(600,550)}>
                <div id="ic-tour"><Link to="/tutorial">First timer? Take the tour!</Link></div>
                {this.getFirst()}
                {this.getSecond()}
                {this.getThird()}
            </div>
        );
    }
}
