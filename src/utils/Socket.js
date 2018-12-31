import SocketIOClient from 'socket.io-client';
import _ from 'underscore';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

const SocketSingleton = (() => {
  class Socket {
    constructor() {
      this.modal = Modal.getInstance();

      this.socket = new SocketIOClient();
      this.sessionId = null;
      this.subscribe({
        'session id': this.onSessionId,
        'mail status': this.onMailStatus,
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
        Toast.getInstance().success('An email has been sent to you. Expect it in 5-10 minutes');
      } else {
        Toast.getInstance().error('I ran into an issue sending you the email. Please note down your codes manually somewhere.');
      }
    };

    onReconnect = ({ compass, users }) => {
      this.socket.emit('reconnected', {
        code: compass.editCode,
        compassId: compass._id,
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

    emitCreateCompass = (topic, username) => {
      if (this.checkConnected()) {
        this.socket.emit('create compass', { topic, username });
      }
    };

    emitAutomatedCreateCompass = (topic, username) => {
      if (this.checkConnected()) {
        this.socket.emit('automated create compass', { topic, username });
      }
    };

    emitSendMail = (code, username, receiverEmail) => {
      if (this.checkConnected()) {
        this.socket.emit('send mail', {
          editCode: code,
          username: username,
          email: receiverEmail,
        });
      }
    };

    emitFindCompassEdit = ({ code, username }) => {
      this.socket.emit('find compass edit', { code, username });
    };

    emitSetCenter = (id, center) => {
      this.socket.emit('set center', { id, center });
    };

    emitMetricLandingPage = (start, end, action) => {
      this.socket.emit('metric landing page time', start, end, action);
    };

    emitMetricEditLinkAccess = (url) => {
      this.socket.emit('metric edit link access', url);
    };

    emitWorkspace = (event, ...args) => {
      this.socket.emit(event, ...args);
    };

    emitMetric = (event, ...args) => {
      this.socket.emit(`metric ${event}`, ...args);
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
