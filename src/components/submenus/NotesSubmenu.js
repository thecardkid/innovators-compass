import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Tappable from 'react-tappable/lib/Tappable';

import ModalSingleton from '../../utils/Modal';
import SocketSingleton from '../../utils/Socket';
import { workspaceMenu } from '../../../test/cypress/data_cy';

export default class NotesSubmenu extends Component {
  constructor(props) {
    super(props);
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  showNewNote = () => {
    ReactGA.modalview('modals/menu-new-text');
    this.props.uiX.showNewNote();
    this.props.hideMenu();
  };

  showImage = () => {
    ReactGA.modalview('modals/menu-new-image');
    this.props.uiX.showImage();
    this.props.hideMenu();
  };

  showDoodle = () => {
    ReactGA.modalview('modals/menu-new-doodle');
    this.props.uiX.showDoodle();
    this.props.hideMenu();
  };

  render() {
    return (
      <div className={'ic-menu ic-notes-submenu'}>
        <section>
          <Tappable onTap={this.showNewNote}>
            <div data-cy={workspaceMenu.notesSubactions.text} className={'ic-menu-item'} onClick={this.showNewNote}>
              Text
              <span className={'ic-shortcut'}>doubleclick</span>
            </div>
          </Tappable>
          <Tappable onTap={this.showImage}>
            <div data-cy={workspaceMenu.notesSubactions.image} className={'ic-menu-item'} onClick={this.showImage}>
              Photo
              <span className={'ic-shortcut'}>shift+doubleclick</span>
            </div>
          </Tappable>
          <Tappable onTap={this.showDoodle}>
            <div data-cy={workspaceMenu.notesSubactions.doodle} className={'ic-menu-item'} onClick={this.showDoodle}>
              Sketch
              <span className={'ic-shortcut'}>alt+doubleclick</span>
            </div>
          </Tappable>
        </section>
      </div>
    );
  }
}
