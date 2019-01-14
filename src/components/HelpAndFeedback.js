import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { Link } from 'react-router';

import Modal from '../utils/Modal';
import Socket from '../utils/Socket';

import { COLORS } from '../../backend/lib/constants';

export default class HelpAndFeedback extends Component {
  constructor() {
    super();
    this.state = {
      active: false,
    };
    this.socket = Socket.getInstance();
    this.modal = Modal.getInstance();
  }

  toggleMenu = () => {
    this.setState({ active: !this.state.active });
  };

  hideMenu = () => {
    this.setState({ active: false });
  };

  showPrivacyStatement = () => {
    this.modal.alertPrivacyStatement();
    this.hideMenu();
  };

  openPrompt = () => {
    this.modal.alertCompassPrompt();
    this.hideMenu();
  };

  showWhatsNew = () => {
    ReactGA.modalview('modals/whats-new');
    this.props.notifyVersionChanges({ mustShow: true });
    this.hideMenu();
  };

  showFeedback = () => {
    this.modal.alertFeedback(this.props.editCode);
    this.hideMenu();
  };

  showAboutUs = () => {
    this.modal.alertAboutUs();
    this.hideMenu();
  };

  renderHelpMenu() {
    return (
      <div className={'ic-menu ic-help-menu'}>
        <section className={'border-bottom'}>
          <div className={'ic-menu-item'} onClick={this.openPrompt}>
            <i className={'material-icons'}>play_arrow</i>
            Get Started
          </div>
          <Link to={'https://www.youtube.com/watch?v=3IbxFHQ5Dxo&feature=youtu.be'} target={'_blank'} onClick={this.hideMenu}>
            <div className={'ic-menu-item'}>
              <i className={'material-icons'}>ondemand_video</i>
              iCompass Guide
            </div>
          </Link>
        </section>
        <section>
          <div className={'ic-menu-item'} onClick={this.showAboutUs}>
            <i className={'material-icons'}>person</i>
            About Us
          </div>
          <div className={'ic-menu-item'} onClick={this.showPrivacyStatement}>
            <i className={'material-icons'}>lock</i>
            Privacy Statement
          </div>
          <div className={'ic-menu-item'} onClick={this.showWhatsNew}>
            <i className={'material-icons'}>new_releases</i>
            What's new?
          </div>
          <div className={'ic-menu-item'} onClick={this.showFeedback}>
            <i className={'material-icons'}>alternate_email</i>
            Contact Us
          </div>
        </section>
      </div>
    );
  }

  render() {
    return (
      <div id={'ic-help'}>
        <button className={'ic-help-button floating-button'}
                style={{background: this.state.active ? COLORS.BLUE : ''}}
             onClick={this.toggleMenu}>
          ?
        </button>
        {this.state.active && this.renderHelpMenu()}
      </div>
    );
  }
}
