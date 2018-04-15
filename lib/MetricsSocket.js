const _ = require('underscore');

const logger = require('./logger');

const simpleLogEvents = [
  'sidebar create new',
  'sidebar bookmark',
  'sidebar email',
  'sidebar edit link',
  'sidebar view link',
  'sidebar pdf',
  'sidebar tweet',
  'sidebar new note',
  'sidebar new doodle',
  'sidebar toggle sidebar',
  'sidebar toggle chat',
  'sidebar toggle prompt',
  'sidebar toggle privacy',
  'sidebar log out',
  'sidebar tutorial',
  'sidebar toggle feedback',
  'sidebar delete compass',
  'sidebar timer form',

  'shortcut key',
  'double click create',
  'toast warn',
  'toast error',

  'enter normal mode',
  'enter compact mode',
  'enter visual mode',
  'enter draft mode',

  'note create',
  'note edit',
  'note doodle',
  'note image',

  'draft submit',
  'visual mode select',
  'visual mode bulk color',
  'visual mode toggle bold',
  'visual mode toggle italic',
  'visual mode toggle underline',
  'visual mode bulk delete',
  'visual mode submit',
];

class MetricsSocket {
  constructor(session) {
    this.io = session.getIo();
    this.socket = session.getSocket();
    this.session = session;

    this.listen('landing page time', this.landingPageTime);
    this.listen('direct url access', this.directUrlAccess);
    this.listen('edit link access', this.editLinkAccess);

    _.each(simpleLogEvents, (ev) => {
      const stmt = ev[0].toUpperCase() + ev.slice(1);
      this.listen(ev, this.simpleLog(stmt));
    });
  }

  listen(event, handler) {
    this.socket.on(`metric ${event}`, handler);
  }

  landingPageTime(start, end, action) {
    logger.metric(`Time spent on landing page to ${action}: ${end - start} ms`);
  }

  directUrlAccess(url) {
    logger.metric(`Direct URL access at ${url}`);
  }

  editLinkAccess(url) {
    logger.metric(`Edit link access at ${url}`);
  }

  simpleLog(stmt) {
    return (...args) => {
      const sessionId = this.session.getSessionId() || 'unknown';
      logger.metric(`Session ${sessionId} - ${stmt} ${args}`);
    };
  }
}

const bindMetricsEvent = (io, socket) => {
  return new MetricsSocket(io, socket);
};

module.exports = bindMetricsEvent;