import html2canvas from 'html2canvas';
import React, { Component } from 'react';

import { HOST, TWEET } from '../../backend/lib/constants';
import ToastSingleton from '../utils/Toast';
import SocketSingleton from '../utils/Socket';

export default class ShareModal extends Component {
  constructor(props) {
    super(props);

    this.state = { canvas: false };

    this.editLink = `${HOST}/compass/edit/${this.props.compass.editCode}`;
    this.viewLink = `${HOST}/compass/view/${this.props.compass.viewCode}`;
    this.toast = ToastSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  dontClose(e) {
    e.stopPropagation();
  }

  componentDidUpdate() {
    if (this.state.canvas) {
      if (this.refs.canvas.children.length > 1) {
        this.refs.canvas.children[1].remove();
      }
      this.refs.canvas.appendChild(this.state.canvas);
    }
  }

  copyEditLink = () => {
    this.socket.emitMetric('share copy edit');
    const text = document.getElementById('ic-edit-link');
    text.select();
    document.execCommand('copy');
    this.toast.info('Edit link has been copied to clipboard');
  };

  copyViewLink = () => {
    this.socket.emitMetric('share copy view');
    const text = document.getElementById('ic-view-link');
    text.select();
    document.execCommand('copy');
    this.toast.info('View-only link has been copied to clipboard');
  };

  tweetThis = () => {
    this.socket.emitMetric('share tweet');
    const tweetURL = TWEET + this.props.compass.viewCode;
    window.open(tweetURL, '_blank').focus();
  };

  exportPng = async () => {
    this.toast.info('Converting to file...');
    try {
      const canvas = await html2canvas(document.getElementById('compass'), {
        allowTaint: true,
        logging: false,
      });

      this.setState({ canvas });
      this.toast.clear();
    } catch (ex) {
      this.toast.error('There was a problem generating a PDF. Please take a screenshot instead.');
    }
  };

  close = () => {
    this.setState({ canvas: null });
    this.props.close();
  };

  render() {
    if (!this.props.show) return null;

    return (
      <div id={'ic-backdrop'} onClick={this.close}>
        <div className={'ic-share'} onClick={this.dontClose}>
          <div className={'contents'}>
            <div className={'header'}>
              <h1 className={'title'}>Share this Workspace</h1>
              <button className={'ic-close-window'} onClick={this.close}>X</button>
            </div>
            <div className={'ic-share-link'}>
              <p>Anyone can <b>edit</b></p>
              <div className={'share-box'}>
                <input id={'ic-edit-link'} value={this.editLink} readOnly={true} />
                <button className={'copy-edit'} onClick={this.copyEditLink}>Copy</button>
              </div>
            </div>
            <div className={'ic-share-link'}>
              <p>Anyone can <b>view</b></p>
              <div className={'share-box'}>
                <input id={'ic-view-link'} value={this.viewLink} readOnly={true} />
                <button className={'copy-view'} onClick={this.copyViewLink}>Copy</button>
              </div>
            </div>
            <div className={'actions'}>
              <button name={'png'} onClick={this.exportPng}>Export as image</button>
              <button onClick={this.tweetThis}>Tweet</button>
              {
                this.state.canvas &&
                <div ref={'canvas'} id={'exported-png'}>
                  <p>Right click on the image below and choose "Save Image As..."</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
