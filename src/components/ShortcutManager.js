import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as uiX from '../actions/ui';

import SocketSingleton from '../utils/Socket';

import { EDITING_MODE } from '../../lib/constants';
import ModalSingleton from '../utils/Modal';

class ShortcutManager extends Component {
  constructor() {
    super();
    this.socket = SocketSingleton.getInstance();
    this.modal = ModalSingleton.getInstance();
  }

  componentDidMount() {
    $(window).on('keydown', this.keydown);
  }

  componentWillUnmount() {
    $(window).off('keydown', this.keydown);
  }

  keydown = (e) => {
    const isEscapeKey = e.which === 27;

    if (this.modal.show && isEscapeKey) {
      return this.modal.close();
    }

    if (this.props.visualMode && isEscapeKey) {
      this.props.uiX.normalMode();
    }

    if (this.props.formVisible) {
      if (isEscapeKey) {
        this.props.uiX.closeForm();
      } else if (this.props.formShortcut) {
        this.props.handle(e);
      }
      return;
    }

    if (document.activeElement.id === 'ic-modal-input'
      || document.activeElement.className === 'people-group') {
      return;
    }

    if (document.activeElement.className.includes('disable-shortcuts')) return;

    this.props.handle(e);
  };

  render() {
    return <div/>;
  }
}

const mapStateToProps = (state) => {
  const { forms } = state.ui;

  return {
    formVisible: forms.newImage || forms.editImage || forms.newText || forms.editText || forms.newDoodle,
    visualMode: state.ui.editingMode === EDITING_MODE.VISUAL,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShortcutManager);
