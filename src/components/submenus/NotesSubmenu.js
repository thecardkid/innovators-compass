import React, { Component } from 'react';

import ModalSingleton from '../../utils/Modal';
import SocketSingleton from '../../utils/Socket';

export default class NotesSubmenu extends Component {
  constructor(props) {
    super(props);
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
  }

  showNewNote = () => {
    this.socket.emitMetric('menu new note');
    this.props.uiX.showNewNote();
    this.props.hideMenu();
  };

  showImage = () => {
    this.socket.emitMetric('menu new image');
    this.props.uiX.showImage();
    this.props.hideMenu();
  };

  showDoodle = () => {
    this.socket.emitMetric('menu new doodle');
    this.props.uiX.showDoodle();
    this.props.hideMenu();
  };

  render() {
    return (
      <div className={'ic-menu ic-notes-submenu'}>
        <section>
          <div className={'ic-menu-item'} onClick={this.showNewNote}>
            Text
            <span className={'ic-shortcut'}>doubleclick</span>
          </div>
          <div className={'ic-menu-item'} onClick={this.showImage}>
            Photo
            <span className={'ic-shortcut'}>shift+doubleclick</span>
          </div>
          <div className={'ic-menu-item'} onClick={this.showDoodle}>
            Sketch
            <span className={'ic-shortcut'}>alt+doubleclick</span>
          </div>
        </section>
      </div>
    );
  }
}