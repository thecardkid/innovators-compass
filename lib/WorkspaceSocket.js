require('babel-polyfill');
const _ = require('underscore');

let UserManager = require('./UserManager');
let MailerSingleton = require('./Mailer');
let { HOST, STICKY_COLORS } = require('./constants');
const Compass = require('../models/compass');
let logger = require('./logger');

let Manager = new UserManager();
let Mail = MailerSingleton.getInstance();

// TODO properly implement catch for all async event handlers.

class WorkspaceSocket {
  constructor(session) {
    this.io = session.getIo();
    this.socket = session.getSocket();
    this.session = session;

    this.socket.on('disconnect', this.onDisconnect.bind(this));
    this.socket.on('reconnected', this.onReconnect.bind(this));
    this.socket.on('logout', this.onLogout.bind(this));
    this.socket.on('send mail', this.sendMail.bind(this));
    this.socket.on('auto send mail', this.autoSendMail.bind(this));
    this.socket.on('send mail bookmarks', this.sendMailBookmarks.bind(this));

    this.socket.on('create compass', this.createCompass.bind(this));
    this.socket.on('automated create compass', this.automatedCreateCompass.bind(this));
    this.socket.on('find compass edit', this.findCompassEdit.bind(this));
    this.socket.on('set center', this.setCenter.bind(this));
    this.socket.on('delete compass', this.deleteCompass.bind(this));

    this.socket.on('new note', this.createNote.bind(this));
    this.socket.on('update note', this.updateNote.bind(this));
    this.socket.on('delete note', this.deleteNote.bind(this));
    this.socket.on('+1 note', this.plusOneNote.bind(this));
    this.socket.on('bulk update notes', this.bulkUpdateNotes.bind(this));
    this.socket.on('bulk drag notes', this.bulkDragNotes.bind(this));
    this.socket.on('bulk delete notes', this.bulkDeleteNotes.bind(this));
  }

  joinRoom(data) {
    this.room = data.code;
    this.username = data.username;
    this.compassId = data.compassId;
    this.socket.join(this.room);
  }

  broadcast(event, ...args) {
    this.io.sockets.in(this.room).emit(event, ...args);
  }

  onDisconnect(reason) {
    if (this.username) {
      logger.info(`${this.username} left room ${this.room} because "${reason}"`);
      let m = Manager.removeUser(this.room, this.username);
      this.broadcast('user left', { users: m, left: this.username });
    }
  }

  async onReconnect(data) {
    if (!data.code) {
      this.socket.emit('workspace not found');
      logger.error('received undefined or null compass code; aborting', JSON.stringify(data));
      throw new Error('null or undefined compass code');
    }
    const compass = await Compass.findByEditCode(data.code);

    if (compass == null) {
      this.socket.emit('workspace not found');
      logger.error(`could not find compass id ${data.code} upon reconnect`);
      throw new Error(`could not find compass with edit code ${data.code}`);
    }

    this.compass = compass;
    if (data.sessionId) {
      this.session.restoreSessionId(data.sessionId);
    } else {
      this.session.newSessionId();
    }
    this.joinRoom(data);
    logger.info(this.username, 'rejoined room', this.room);

    let o = Manager.refreshUser(this.room, this.username, data.color);
    this.broadcast('user joined', { users: o.manager, joined: this.username });
  }

  onLogout() {
    this.onDisconnect('log out');
  }

  sendMail(data) {
    const text = 'Access your compass via this link ' +
      `${HOST}/compass/edit/${data.editCode}/${data.username}`;

    Mail.sendMessage({
      subject: 'Your iCompass workspace link',
      text,
      toEmail: data.email,
      cb: (status) => this.socket.emit('mail status', status),
    });
  }

  autoSendMail(data) {
    const text = `
Access your compass via this link ${HOST}/compass/edit/${data.editCode}/${data.username}.


You received this email because you asked iCompass to automatically send you the link to a workspace
whenever you create one. To stop receiving these automatic emails, please go to this link:
${HOST}/disable-auto-email.
`;

    Mail.sendMessage({
      subject: 'Your iCompass workspace link',
      text,
      toEmail: data.email,
      cb: (status) => this.socket.emit('auto mail status', status),
    });
  }

  sendMailBookmarks(data) {
    let text = 'Below are your iCompass bookmarks:\n\n';

    _.each(data.bookmarks, ({ center, href }) => text += `${center}: ${HOST}${href}\n\n`);

    Mail.sendMessage({
      subject: 'Your iCompass bookmarks',
      text,
      toEmail: data.email,
      cb: (status) => this.socket.emit('mail status', status),
    });
  }

  async createCompass(data) {
    try {
      const compass = await Compass.makeCompass(data.topic);
      logger.debug('Created compass with topic', data.topic, compass._id);
      this.socket.emit('compass ready', {
        success: !!compass,
        topic: data.topic,
        code: compass.editCode,
      });
    } catch (ex) {
      logger.error('Error creating compass: ', JSON.stringify(data), ex);
      throw new Error(ex);
    }
  }

  async automatedCreateCompass(data) {
    // Copy-pasted from above
    try {
      const compass = await Compass.makeCompass(data.topic);
      logger.debug('Automation created compass with topic', data.topic, compass._id);
      this.socket.emit('automated compass ready', {
        success: !!compass,
        topic: data.topic,
        code: compass.editCode,
      });
    } catch (ex) {
      logger.error('Error automate creating compass: ', JSON.stringify(data), ex);
      throw new Error(ex);
    }
  }

  async setCenter(data) {
    try {
      this.compass = await this.compass.setCenter(data.center);
      if (!!this.compass) {
        this.socket.emit('center set', data.center);
      }
    } catch (ex) {
      logger.error('Error setting center: ', JSON.stringify(data), ex);
      throw new Error(ex);
    }
  }

  async findCompassEdit(data) {
    try {
      const compass = await Compass.findByEditCode(data.code);
      if (compass !== null) {
        let o = Manager.addUser(data.code, data.username);
        if (o.message) {
          // o.message is 'bad username' | 'username exists'. These
          // are handled in Workspace.jsx
          this.socket.emit(o.message);
          return;
        }
        data.username = o.newUser;
        data.compassId = compass._id.toString();

        this.joinRoom(data);
        logger.info(this.username, 'joined room', this.room);
        this.broadcast('user joined', { users: o.manager, joined: this.username });
      }
      this.compass = compass;
      this.socket.emit('compass found', {
        compass: compass,
        username: this.username || data.username,
        viewOnly: false,
      });
    } catch (ex) {
      logger.error('Error find compass edit: ', JSON.stringify(data), ex);
      throw new Error(ex);
    }
  }

  deleteCompass(id) {
    if (this.compassId !== id) {
      return;
    }

    Compass.remove({ _id: id }, (err) => {
      if (err) {
        logger.error('Error deleting compass: ', id, err);
        throw new Error(err);
      }

      logger.info(this.username, 'deleted compass', id);
      this.broadcast('compass deleted');
    });
  }

  async createNote(note) {
    try {
      this.compass = await this.compass.addNote(note);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      logger.error('Error creating note: ', JSON.stringify(note), ex);
      throw new Error(ex);
    }
  }

  async updateNote(updatedNote) {
    try {
      this.compass = await this.compass.updateNote(updatedNote);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      logger.error('Error updating note: ', JSON.stringify(updatedNote), ex);
      throw new Error(ex);
    }
  }

  async deleteNote(id) {
    try {
      const { compass, deletedIdx } = await this.compass.deleteNote(id);
      this.compass = compass;
      this.broadcast('update notes', compass.notes);
      this.broadcast('deleted notes', deletedIdx);
    } catch (ex) {
      logger.error('Error deleting note: ', id, ex);
      throw new Error(ex);
    }
  }

  async plusOneNote(id) {
    try {
      this.compass = await this.compass.plusOneNote(id);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      logger.error('Error upvoting note: ', id, ex);
      throw new Error(ex);
    }
  }

  async bulkUpdateNotes(ids, transformation) {
    try {
      if (transformation.color == null) return;

      if (!_.contains(STICKY_COLORS, transformation.color)) return;

      this.compass = await this.compass.bulkUpdateNotes(ids, transformation);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      logger.error('Error bulk updating notes: ', JSON.stringify({ ids, transformation }), ex);
      throw new Error(ex);
    }
  }

  async bulkDragNotes(ids, { dx, dy }) {
    try {
      this.compass = await this.compass.bulkDragNotes(ids, { dx, dy });
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      logger.error('Error bulk dragging notes: ', JSON.stringify({ ids, dx, dy }), ex);
      throw new Error(ex);
    }
  }

  async bulkDeleteNotes(ids) {
    try {
      const { compass, deletedIdx } = await this.compass.deleteNotes(ids);
      this.compass = compass;
      this.broadcast('update notes', this.compass.notes);
      this.broadcast('deleted notes', deletedIdx);
    } catch (ex) {
      logger.error('Error bulk deleting notes: ', ids, ex);
      throw new Error(ex);
    }
  }
}

const bindWorkspaceEvents = (io, socket) => {
  return new WorkspaceSocket(io, socket);
};

module.exports = bindWorkspaceEvents;
