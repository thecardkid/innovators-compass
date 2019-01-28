const _ = require('underscore');
const { STICKY_COLORS, REGEX } = require('./constants');

module.exports = class UserManager {
  constructor() {
    this.rooms = {};
  }

  getRoom(code) {
    if (_.has(this.rooms, code)) {
      return this.rooms[code];
    } else {
      return {
        usernameToColor: {},
        colors: _.clone(STICKY_COLORS),
      };
    }
  }

  setRoom(code, manager) {
    return this.rooms[code] = manager;
  }

  cleanUsers(code) {
    const manager = this.getRoom(code);
    for (let username in manager.usernameToColor) {
      if (!manager.usernameToColor.hasOwnProperty(username)) {
        continue;
      }
      if (typeof username !== 'string' || username.length === 0 || !REGEX.CHAR_ONLY.test(username)) {
        delete manager.usernameToColor[username];
      }
    }
  }

  refreshUser(code, username) {
    this.cleanUsers(code);
    if (username.length === 0) {
      return { message: 'bad username' };
    }
    const manager = this.getRoom(code);
    // don't care if username already exists in the room or not
    // - assign it or overwrite it. Allow overwrite because
    // this only called on re-connection, which is not triggered
    // by the user.
    manager.usernameToColor[username] = manager.colors.shift();
    if (_.isEmpty(manager.colors)) {
      manager.colors = _.clone(STICKY_COLORS);
    }
    return {
      manager: this.setRoom(code, manager),
      newUser: username,
    };
  }

  addUser(code, username) {
    this.cleanUsers(code);
    // Pretty jank here - but fast fix. Return object with
    // a string that is a socket message to be handled by the frontend.
    if (username.length === 0 || !REGEX.CHAR_ONLY.test(username)) {
      return { message: 'bad username' };
    }
    const manager = this.getRoom(code);
    if (username in manager.usernameToColor) {
      return { message: 'username exists' };
    }
    manager.usernameToColor[username] = manager.colors.shift();
    if (_.isEmpty(manager.colors)) {
      manager.colors = _.clone(STICKY_COLORS);
    }
    return {
      manager: this.setRoom(code, manager),
      newUser: username,
    };
  }

  deleteRoom(code) {
    delete this.rooms[code];
    return null;
  }

  removeUser(code, username) {
    const m = this.getRoom(code);
    delete m.usernameToColor[username];
    if (_.isEmpty(m.usernameToColor)) {
      return this.deleteRoom(code);
    }
    return this.setRoom(code, m);
  }
};
