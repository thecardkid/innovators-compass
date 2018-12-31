import $ from 'jquery';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';

import * as uiX from '../actions/ui';

import BookmarkList from '../components/BookmarkList.jsx';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket.js';
import Toast from '../utils/Toast';

import MaybeTappable from '../utils/MaybeTappable';
import DevOnly from '../utils/DevOnly';

import { REGEX } from '../../lib/constants';

class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.toast = Toast.getInstance();
    this.modal = Modal.getInstance();

    this.socket = Socket.getInstance();
    this.socket.subscribe({
      'compass ready': this.onCompassReady,
    });

    ReactGA.pageview('/');
    this.props.uiX.setScreenSize(window.innerWidth, window.innerHeight);
  }

  componentDidMount() {
    this.start = Date.now();
    $(window).on('resize', this.props.uiX.resize);
  }

  componentWillUnmount() {
    $(window).off('resize', this.props.uiX.resize);
  }

  onCompassReady = (data) => {
    if (!data.success) {
      return this.modal.alert({
        heading: 'Whoops...',
        body: 'Something went wrong. Please <a href="mailto:hieumaster95@gmail.com"><u>let Hieu know.</u></a>',
      });
    }

    this.promptForEmail();
    this.setState({ data });
  };

  onAutomatedCompassReady = (data) => {
    if (!data.success) {
      return this.toast.error('Failed to create workspace. Check logs');
    }

    return browserHistory.push(`/compass/edit/${data.code}/${this.state.username}`);
  };

  validateMakeInput = (e) => {
    e.preventDefault();

    const topic = this.refs.topic.value;
    const username = this.refs.username.value;

    if (!REGEX.CHAR_ONLY.test(username)) {
      return this.toast.error('Username cannot contain spaces or numbers, only letters.');
    }

    this.setState({ username });
    this.socket.emitCreateCompass(topic, username);
    this.socket.emitMetricLandingPage(this.start, Date.now(), 'create');
  };

  automateSetup = (e) => {
    e.preventDefault();

    const topic = 'test-topic';
    const username = 'testuser';

    this.setState({ username });

    this.socket.subscribe({
      'automated compass ready': this.onAutomatedCompassReady,
    });
    this.socket.emitAutomatedCreateCompass(topic, username);
  };

  promptForEmail = () => {
    this.modal.promptForEmail((status, email) => {
      if (!status) {
        this.toast.warn('You need to complete this action');
        return this.promptForEmail();
      }

      if (!email.length) {
        const { code } = this.state.data;
        return browserHistory.push(`/compass/edit/${code}/${this.state.username}`);
      }

      if (REGEX.EMAIL.test(email)) {
        const { code } = this.state.data;
        this.socket.emitSendMail(code, this.state.username, email);
        return browserHistory.push(`/compass/edit/${code}/${this.state.username}`);
      }

      this.toast.error(`"${email}" is not a valid email address`);
      this.promptForEmail();
    });
  };

  sizeImage() {
    const r = 1.9174434087882823;
    const { vw, vh } = this.props.ui;
    const screenRatio = vw / vh;

    if (screenRatio <= r) {
      return {
        width: r * vh,
        height: vh,
      };
    } else {
      return {
        width: vw,
        height: vw / r,
      };
    }
  }

  render() {
    return (
      <div id={'ic-landing'}>
        <MaybeTappable handleTapOrClick={this.toast.clear}>
          <div id={'ic-toast'}/>
        </MaybeTappable>
        <img src={'https://s3.us-east-2.amazonaws.com/innovatorscompass/landing.jpg'} className={'ic-background'} style={this.sizeImage()}/>
        <BookmarkList start={this.start}/>
        <div id={'ic-landing-container'}>
          <div id={'message'}>
            <h1>Innovators' Compass</h1>
            <h2>Powerful questions, and space to explore them, to make anything better.</h2>
          </div>
          <div id={'get-started-form'}>
            <form onSubmit={this.validateMakeInput}>
              <p>What topic are you working on?</p>
              <input id="compass-center"
                     ref="topic"
                     required />
              <p>Your first name</p>
              <input id="username"
                     ref="username"
                     maxLength={15}
                     required />
              <br/>
              <button type={'submit'} id={'user-submit'}>
                Get started
                <i className="material-icons">arrow_forward</i>
              </button>
              <DevOnly>
                <button className={'automate-workspace-setup'} onClick={this.automateSetup}>
                  Automate Setup (only shown in development)
                </button>
              </DevOnly>
            </form>
          </div>
          <a href={'https://youtu.be/3IbxFHQ5Dxo'} className={'ic-guide'}>
            First-timer? Watch this <u>short two-minute video</u>!
          </a>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ui: state.ui,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
