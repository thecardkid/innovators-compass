import $ from 'jquery';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Tappable from 'react-tappable/lib/Tappable';
import { bindActionCreators } from 'redux';
import _ from 'underscore';

import ModesSubmenu from './submenus/ModesSubmenu';
import NotesSubmenu from './submenus/NotesSubmenu';
import ShortcutManager from './ShortcutManager';

import ModalSingleton from '../utils/Modal';
import SocketSingleton from '../utils/Socket';
import Storage from '../utils/Storage';
import ToastSingleton from '../utils/Toast';

import * as uiX from '../actions/ui';
import * as workspaceX from '../actions/workspace';
import { EDITING_MODE, COLORS, REGEX } from '../../backend/lib/constants';

class WorkspaceMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      darkTheme: Storage.isDarkTheme(),
      submenus: {
        notes: false,
        modes: false,
        users: false,
      },
    };

    this.shortcuts = {
      68: props.uiX.showDoodle,
      73: props.uiX.showImage,
      78: props.uiX.showNewNote,
      shift: {
        49: this.changeMode('standard'),
        50: this.changeMode('compact'),
        51: this.changeMode('bulk'),
      },
    };
    this.modal = ModalSingleton.getInstance();
    this.socket = SocketSingleton.getInstance();
    this.toast = ToastSingleton.getInstance();
  }

  _handleShortcuts = (e) => {
    let shortcuts = this.shortcuts;

    if (e.metaKey) return;

    if (e.shiftKey) shortcuts = this.shortcuts.shift;

    if (_.has(shortcuts, e.which)) {
      e.preventDefault();
      this.socket.emitMetric('shortcut key', e.which);
      shortcuts[e.which]();
    }
  };

  changeMode = (mode) => () => {
    switch (mode) {
      case 'standard':
        this.toast.info('Switched to standard mode');
        this.hideMenu();
        return this.props.uiX.normalMode();

      case 'compact':
        this.toast.info('Switched to compact mode');
        this.hideMenu();
        return this.props.uiX.compactMode();

      case 'bulk':
        this.toast.info('Switched to bulk edit mode');
        this.hideMenu();
        return this.props.uiX.visualMode(this.props.notes.length);

      default:
        this.hideMenu();
        return;
    }
  };

  showShareModal = () => {
    ReactGA.modalview('modals/menu-share');
    this.props.uiX.showShareModal();
    this.hideMenu();
  };

  buttonChangeMode = (switchTo) => () => {
    this.socket.emitMetric(`menu ${switchTo}`);
    this.changeMode(switchTo)();
  };

  openNewWorkspace = () => {
    this.socket.emitMetric('menu new workspace');
    window.open('/', '_blank').focus();
    this.hideMenu();
  };

  triggerEmailModal = () => {
    // Track here instead of in emailReminder because
    // that function calls itself
    ReactGA.modalview('modals/menu-email');
    this.emailReminder();
    this.hideMenu();
  };

  emailReminder = (email) => {
    email = typeof email === 'string' ? email : '';

    this.modal.prompt({
      heading: 'Receive a Link to this Workspace',
      body: [
        ' You\'ll need the link to the compass to access it again. To email yourself the link now, enter your email address below.',
        'I will not store your email address or send you spam.',
      ],
      defaultValue: email,
      cb: (status, email) => {
        if (!status) return;

        if (REGEX.EMAIL.test(email)) {
          return this.socket.emitSendMail(this.props.compass.editCode, this.props.users.me, email);
        } else {
          this.toast.error(`"${email}" is not a valid email address`);
          this.emailReminder(email);
        }
      },
    });
  };

  bookmark = () => {
    const { topic, editCode } = this.props.compass;

    if (Storage.hasBookmark(editCode)) {
      this.modal.alert({
        heading: 'Already bookmarked!',
        body: 'Check for the yellow bookmark icon at the top right.',
      });
    } else {
      ReactGA.modalview('modals/menu-bookmark');
      this.modal.prompt({
        heading: 'Bookmark',
        body: [
          'Bookmarks give you quick access to workspaces from the app\'s home page - but can be lost if your browser cache is erased.',
          'To never lose access to your compass, email yourself a link, or copy and paste it somewhere secure.'
        ],
        defaultValue: topic,
        cb: (submit, bookmarkName) => {
          if (submit) {
            let username = this.props.users.me.replace(/\d+/g, '');
            Storage.addBookmark(bookmarkName, editCode, username);
            this.toast.success('Bookmarked this workspace!');
            this.props.uiX.setBookmark(true);
          }
        },
      });
    }

    this.hideMenu();
  };

  logout = () => {
    this.socket.emitMetric('menu log out');
    browserHistory.push('/');
  };

  confirmDelete = () => {
    ReactGA.modalview('modals/menu-delete');
    this.modal.confirm({
      body: 'You are about to delete this workspace. This action cannot be undone',
      confirmText: 'Delete',
      cb: (confirmed) => {
        if (confirmed) {
          Storage.removeBookmarkByCenter(this.props.compass.topic);
          this.socket.emitDeleteCompass(this.props.compass._id);
        }
      },
    });
    this.hideMenu();
  };

  showSubmenu = (submenu) => () => {
    this.setState({ submenus: {
      notes: false,
      modes: false,
      users: false,
      [submenu]: true,
    }});
  };

  hideSubmenus = () => {
    this.setState({ submenus: {
      notes: false,
      modes: false,
      users: false,
    }});
  };

  renderUsersSubmenu = () => {
    const { me } = this.props.users;
    const users = _.map(this.props.users.nameToColor, (color, name) => {
      return (
        <div className={'ic-menu-item ic-user'} key={`user-${name}`}>
          <span className={'user-color'} style={{background: color}} />
          {name === me ? `${name} (You)` : name}
        </div>
      );
    });
    return (
      <div className={'ic-menu ic-users-submenu'}>
        <section>{users}</section>
      </div>
    );
  };

  toggleDarkTheme = (e) => {
    const darkTheme = Storage.setDarkTheme(e.target.checked);
    this.setState({ darkTheme });
  };

  renderMenu = () => {
    const { notes, modes, users } = this.state.submenus;

    return (
      <div className={'ic-menu ic-workspace-menu'}>
        <section className={'border-bottom'} onMouseEnter={this.hideSubmenus}>
          <div className={'ic-menu-item'} onClick={this.openNewWorkspace}>
            <i className={'material-icons'}>create_new_folder</i>
            New Workspace
          </div>
          <div className={'ic-menu-item'}>
            <i className={'material-icons'}>brightness_2</i>
            Dark Theme
            <label className={'switch'}>
              <input type={'checkbox'} onChange={this.toggleDarkTheme} checked={this.state.darkTheme}/>
              <span className={'slider'} />
            </label>
          </div>
        </section>
        <section className={'border-bottom'} onMouseEnter={this.hideSubmenus}>
          <div className={'ic-menu-item'} onClick={this.triggerEmailModal}>
            <i className={'material-icons'}>email</i>
            Save via Email
          </div>
          <div className={'ic-menu-item'} onClick={this.bookmark}>
            <i className={'material-icons'}>bookmark</i>
            Save as Bookmark
          </div>
          <div className={'ic-menu-item'} onClick={this.showShareModal}>
            <i className={'material-icons'}>share</i>
            Share Workspace
          </div>
        </section>
        <section className={'border-bottom'}>
          <Tappable onTap={this.showSubmenu('notes')}>
            <div className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('notes')}>
              Add Note
              {notes && <NotesSubmenu uiX={this.props.uiX} hideMenu={this.hideMenu}/>}
            </div>
          </Tappable>
          <Tappable onTap={this.showSubmenu('modes')}>
            <div className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('modes')}>
              Change Mode
              {modes && <ModesSubmenu modes={this.props.modes} changeMode={this.buttonChangeMode} hideMenu={this.hideMenu}/>}
            </div>
          </Tappable>
          <Tappable onTap={this.showSubmenu('users')}>
            <div className={'ic-menu-item has-more'} onMouseOver={this.showSubmenu('users')}>
              Collaborators
              {users && this.renderUsersSubmenu()}
            </div>
          </Tappable>
        </section>
        <section onMouseEnter={this.hideSubmenus}>
          <div className={'ic-menu-item'} onClick={this.logout}>
            <i className={'material-icons'}>lock</i>
            Log Out
          </div>
          <div className={'ic-menu-item dangerous'} onClick={this.confirmDelete}>
            <i className={'material-icons'}>delete</i>
            Delete Workspace
          </div>
        </section>
      </div>
    );
  };

  toggleMenu = () => {
    if (this.state.active) {
      return this.hideMenu();
    }
    this.setState({ active: true });
  };

  hideMenu = () => {
    this.setState({
      active: false,
      submenus: {
        notes: false,
        modes: false,
        users: false,
      },
    });
  };

  render() {
    if (this.state.darkTheme) {
      $('#container').addClass('dark-theme');
      $('#ic-modal-container').addClass('dark-theme');
    } else {
      $('#container').removeClass('dark-theme');
      $('#ic-modal-container').removeClass('dark-theme');
    }

    return (
      <div id={'ic-workspace-menu'}>
        <button className={'ic-workspace-button floating-button'}
                style={{background: this.state.active ? COLORS.BLUE : ''}}
              onClick={this.toggleMenu}>
          <i className="material-icons">menu</i>
        </button>
        {this.state.active && this.renderMenu()}
        <ShortcutManager handle={this._handleShortcuts} />
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    compass: state.compass,
    notes: state.notes,
    users: state.users,
    modes: {
      normal: state.ui.editingMode === EDITING_MODE.NORMAL || false,
      compact: state.ui.editingMode === EDITING_MODE.COMPACT || false,
      bulk: state.ui.editingMode === EDITING_MODE.VISUAL || false,
    },
    hasDrafts: (state.workspace.drafts || []).length > 0,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
    workspaceX: bindActionCreators(workspaceX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkspaceMenu);
