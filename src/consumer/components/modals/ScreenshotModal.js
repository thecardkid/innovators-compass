import html2canvas from 'html2canvas';
import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';

import ToastSingleton from '../../../utils/Toast';

export default class ScreenshotModal extends Component {
  constructor(props) {
    super(props);
    this.state = { canvas: null };
    this.toast = ToastSingleton.getInstance();
  }

  componentDidMount() {
    this.exportPng();
  }

  componentDidUpdate() {
    if (this.state.canvas) {
      if (this.refs.canvas.children.length > 1) {
        this.refs.canvas.children[1].remove();
      }
      this.refs.canvas.appendChild(this.state.canvas);
    }
  }

  dontClose(e) {
    e.stopPropagation();
  }

  close = () => {
    this.setState({ canvas: null });
    this.props.close();
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

  render() {
    if (isMobile) {
      return (
        <div id={'ic-backdrop'} onClick={this.close}>
          <div className={'ic-screenshot ic-dynamic-modal'} onClick={this.dontClose}>
            <div className={'contents'}>
              <div className={'header'}>
                <h1 className={'title'}>Export as Screenshot</h1>
                <button className={'ic-close-window'} onClick={this.close}>X</button>
              </div>
              <div className={'warning'}>
                <b>NOTE:</b> This feature is not available on mobile/tablet. Please access this workspace on your desktop instead.
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div id={'ic-backdrop'} onClick={this.close}>
        <div className={'ic-screenshot ic-dynamic-modal'} onClick={this.dontClose}>
          <div className={'contents'}>
            <div className={'header'}>
              <h1 className={'title'}>Export as Screenshot</h1>
              <button className={'ic-close-window'} onClick={this.close}>X</button>
              <div ref={'canvas'} id={'exported-png'}>
                <p>Right click on the image below and choose "Save Image As..."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
