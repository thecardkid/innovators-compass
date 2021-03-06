const socketIO = require('socket.io');
const uuidv4 = require('uuid/v4');

const bindWorkspaceEvents = require('./WorkspaceSocket');

class SocketSession {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
    this.newSessionId();
  }

  restoreSessionId(sessionId) {
    this.sessionId = sessionId;
  }

  newSessionId() {
    this.sessionId = uuidv4();
    this.socket.emit('session id', this.sessionId);
  }

  getSessionId() {
    return this.sessionId;
  }

  getIo() {
    return this.io;
  }

  getSocket() {
    return this.socket;
  }
}

module.exports = {
  connect: (server) => {
    const io = socketIO.listen(server);
    io.set('transports', ['websocket']);

    io.sockets.on('connection', (socket) => {
      const session = new SocketSession(io, socket);

      bindWorkspaceEvents(session);
    });
  },
};
