import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Tappable from 'react-tappable/lib/Tappable';

import ModalSingleton from '../../../utils/Modal';
import SocketSingleton from '../../../utils/Socket';

export default class ExportSubmenu extends Component {
  constructor(props) {
    super(props);
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  showExportGDocModal = () => {
    ReactGA.modalview('modals/export-gdoc');
    this.props.uiX.showGDocModal();
    this.props.hideMenu();
  };

  showExportScreenshot = () => {
    ReactGA.modalview('modals/export-png');
    this.props.uiX.showScreenshotModal();
    this.props.hideMenu();
  };

  render() {
    return (
      <div className={'ic-menu ic-exports-submenu'}>
        <section>
          <Tappable onTap={this.showExportGDocModal}>
            <div className={'ic-menu-item'} onClick={this.showExportGDocModal}>
              Google Doc
            </div>
          </Tappable>
          <Tappable onTap={this.showExportScreenshot}>
            <div className={'ic-menu-item'} onClick={this.showExportScreenshot}>
              Screenshot (.png)
            </div>
          </Tappable>
        </section>
      </div>
    );
  }
}
