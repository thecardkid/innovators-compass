import { browserHistory } from 'react-router';
import SocketIOClient from 'socket.io-client';
import _ from 'underscore';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

const SocketSingleton = (() => {
  class Socket {
    constructor() {
      this.modal = Modal.getInstance();

      this.socket = new SocketIOClient('/', {
        transports: ['websocket'],
      });
      this.sessionId = null;
      this.subscribe({
        'session id': this.onSessionId,
        'mail status': this.onMailStatus,
        'auto mail status': this.onAutoMailStatus,
        'workspace not found': this.onWorkspaceNotFound,
      });
    }

    subscribe = (eventListeners) => {
      _.each(eventListeners, (listener, event) => {
        this.socket._callbacks[`$${event}`] = [listener];
      });
    };

    isConnected = () => {
      return this.socket.connected;
    };

    checkConnected = () => {
      if (this.isConnected()) return true;
      Toast.getInstance().error('You are not connected to the server');
    };

    onSessionId = (sessionId) => {
      this.sessionId = this.sessionId || sessionId;
    };

    onMailStatus = (success) => {
      if (success) {
        Toast.getInstance().success('A link to this workspace has been sent to you');
      } else {
        Toast.getInstance().error('There was an issue sending you the email. Please note down your codes manually somewhere.');
      }
    };

    onAutoMailStatus = (success) => {
      if (success) {
        Toast.getInstance().success('A link to this workspace has been automatically sent to you.');
      } else {
        Toast.getInstance().error('There was an issue sending you the email. Please note down your codes manually somewhere.');
      }
    };

    onWorkspaceNotFound = () => {
      this.modal.alert({
        heading: 'Sorry!',
        body: [
          'There was a problem retrieving your workspace.',
          'You will now be taken to the home page.',
        ],
        cb: () => browserHistory.push('/'),
      });
    };

    onReconnect = ({ editCode, users }) => {
      this.socket.emit('reconnected', {
        code: editCode,
        username: users.me,
        color: users.nameToColor[users.me],
        sessionId: this.sessionId,
      });
    };

    logout = () => {
      this.socket.emit('logout');
    };

    emitNewNote = (note) => {
      if (this.checkConnected()) {
        this.socket.emit('new note', note);
      }
    };

    emitEditNote = (edited) => {
      if (this.checkConnected()) {
        this.socket.emit('update note', edited);
      }
    };

    emitBulkEditNotes = (noteIds, transformation) => {
      if (this.checkConnected()) {
        this.socket.emit('bulk update notes', noteIds, transformation);
      }
    };

    emitBulkDeleteNotes = (noteIds) => {
      if (this.checkConnected()) {
        this.socket.emit('bulk delete notes', noteIds);
      }
    };

    emitDragNote = (note) => {
      if (this.checkConnected()) {
        this.socket.emit('update note', note);
        return true;
      }
      return false;
    };

    emitDeleteCompass = (id) => {
      if (this.checkConnected()) {
        this.socket.emit('delete compass', id);
      }
    };

    emitDeleteNote = (noteId) => {
      if (this.checkConnected()) {
        this.socket.emit('delete note', noteId);
      }
    };

    emitCreateCompass = (topic, username, password) => {
      if (this.checkConnected()) {
        this.socket.emit('create compass', { topic, username, password });
      }
    };

    emitAutomatedCreateCompass = (topic, username) => {
      if (this.checkConnected()) {
        this.socket.emit('automated create compass', { topic, username });
      }
    };

    emitSendFeedback = (email, note) => {
      if (this.checkConnected()) {
        this.socket.emit('send feedback', { email, note });
      }
    };

    emitSendMail = (editCode, username, email) => {
      if (this.checkConnected()) {
        this.socket.emit('send mail', { editCode, username, email });
      }
    };

    emitAutoSendMail = (editCode, username, email) => {
      if (this.checkConnected()) {
        this.socket.emit('auto send mail', { editCode, username, email });
      }
    };

    emitFindCompassEdit = ({ code, username }) => {
      this.socket.emit('find compass edit', { code, username });
    };

    emitSetCenter = (id, center) => {
      this.socket.emit('set center', { id, center });
    };

    emitSetCenterPosition = (id, x, y) => {
      this.socket.emit('set center position', { id, x, y });
    };

    emitResetCenterPosition = () => {
      this.socket.emit('set center position', { x: 0.5, y: 0.5 });
    };

    emitWorkspace = (event, ...args) => {
      this.socket.emit(event, ...args);
    };
  }

  let instance;

  return {
    getInstance: () => {
      if (instance == null) {
        instance = new Socket();
        instance.constructor = null;
      }

      return instance;
    }
  };
})();

export default SocketSingleton;
