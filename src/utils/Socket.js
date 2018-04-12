import SocketIOClient from 'socket.io-client';
import _ from 'underscore';

import Modal from '../utils/Modal';
import Toast from '../utils/Toast';

import { PROMPTS } from '../../lib/constants';

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

    onMailStatus = (status) => {
      if (status) Toast.getInstance().success(PROMPTS.EMAIL_SENT);
      else Toast.getInstance().error(PROMPTS.EMAIL_NOT_SENT);
    };

    emitReconnected = ({ compass, users }) => {
      this.socket.emit('reconnected', {
        code: compass.editCode,
        compassId: compass._id,
        username: users.me,
        color: users.nameToColor[users.me],
        sessionId: this.sessionId,
      });
    };

    emitCreateTimer = (min, sec) => {
      if (this.checkConnected()) {
        this.socket.emit('create timer', min, sec, Date.now());
      }
    };

    emitCancelTimer = () => {
      if (this.checkConnected()) {
        this.socket.emit('cancel timer');
      }
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

    emitMessage = (username, text) => {
      if (!text) return;
      if (this.checkConnected()) {
        this.socket.emit('message', { username, text });
      }
    };

    emitCreateCompass = (topic, username) => {
      if (this.checkConnected()) {
        this.socket.emit('create compass', { topic, username });
      }
    };

    emitFindCompass = (code, username) => {
      if (this.checkConnected()) {
        this.socket.emit('find compass', { code, username });
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

    emitFindCompassView = ({ code, username }) => {
      this.socket.emit('find compass view', { code, username });
    };

    emitSetCenter = (id, center) => {
      this.socket.emit('set center', { id, center });
    };

    emitMetricLandingPage = (start, end, action) => {
      this.socket.emit('metric landing page time', start, end, action);
    };

    emitMetricDirectUrlAccess = (url) => {
      this.socket.emit('metric direct url access', url);
    };

    emitMetricEditLinkAccess = (url) => {
      this.socket.emit('metric edit link access', url);
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
