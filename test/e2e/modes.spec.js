const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const {
  setup,
  cleanup,
  expectCompassStructure,
  menuActions,
  selectMenuOption,
} = require('./utils');

const expect = chai.expect;
const b = browser;

describe('view modes', () => {
  let editURL,
    viewURL,
    editCode,
    viewCode;

  beforeAll(() => {
    setup();

    b.moveToObject('body', 100, 100);
    b.doDoubleClick();
    b.waitForDisplayed('#ic-note-form');
    b.setValue('#ic-form-text .ql-editor', 'this is a note');
    b.click('button[name=ship]');
    b.pause(200);
    expect('div.ic-sticky-note').to.have.count(1);

    b.moveToObject('body', 300, 100);
    b.doDoubleClick();
    b.waitForDisplayed('#ic-note-form');
    b.setValue('#ic-form-text .ql-editor', 'this is a note');
    b.click('button[name=draft]');
    b.pause(200);
    expect('div.ic-sticky-note').to.have.count(2);

    const editCodeRegex = /\/compass\/edit\/([0-9a-zA-Z]{8})/;
    const editMatch = editCodeRegex.exec(b.getUrl());
    expect(editMatch).to.have.length(2);
    editCode = editMatch[1];
    editURL = `http://localhost:8080/compass/edit/${editCode}`;
    expect(b.getUrl()).to.equal(`${editURL}/sandbox`);

    selectMenuOption(menuActions.share);
    b.waitForDisplayed('.ic-share');
    const viewCodeRegex = /\/compass\/view\/([0-9a-zA-Z]{8})/;
    const viewMatch = viewCodeRegex.exec(b.getValue('input#ic-view-link'));
    expect(viewMatch).to.have.length(2);
    viewCode = viewMatch[1];
    viewURL = `http://localhost:8080/compass/view/${viewCode}`;
  });

  afterAll(cleanup);

  describe('view-only mode', () => {
    it('view-only mode from link', () => {
      b.url(viewURL);
      b.waitForDisplayed('#compass');
      expect('#center').to.be.visible();
      expect('#vline').to.be.visible();
      expect('#hline').to.be.visible();
      // From test/e2e/utils.js:setup
      expect('#ic-compass-topic').to.have.text(/webdriverio/);
      expect('.ic-workspace-button').to.not.be.there();
      expect('.ic-help-button').to.not.be.there();

      expectCompassStructure();
    });

    it('cant see drafts', () => {
      expect('.ic-sticky-note').to.have.count(1);
      expect('.draft').to.have.count(0);
    });

    it('cant create notes', () => {
      b.moveToObject('body', 200, 200);
      b.doDoubleClick();
      b.pause(200);
      expect('.ic-form').to.not.be.visible();
    });

    it('cant drag notes', () => {
      const oldPos = b.getLocation('#note0');

      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note0', 110, 110);
      b.buttonUp(0);
      const newPos = b.getLocation('#note0');

      expect(oldPos.x).to.equal(newPos.x);
      expect(oldPos.y).to.equal(newPos.y);
    });

    it('cant edit notes', () => {
      b.moveToObject('#note0', 10, 10);
      b.doDoubleClick();
      b.pause(200);
      expect('.ic-form').to.not.be.visible();
    });

    it('cant delete notes', () => {
      expect('div.ic-sticky-note button.ic-close-window').to.not.be.there();
    });

    it('cant upvote notes', () => {
      expect('p.ic-upvote').to.not.be.there();
    });

    it('cant edit center', () => {
      b.moveToObject('#center', 10, 10);
      b.doDoubleClick();
      b.pause(200);
      expect('#ic-modal').to.not.be.visible();
    });

    it('cant drag select', () => {
      b.moveToObject('body', 300, 300);
      b.buttonDown(0);
      b.moveToObject('body', 400, 400);

      expect('div#select-area').to.not.be.there();
      b.buttonUp(0);
    });

    it('cant see context menu', () => {
      b.moveToObject('#note0', 10, 10);
      b.rightClick();
      b.pause(100);
      expect('div.ic-menu.context-menu').to.not.be.visible();
    });
  });

  describe('edit mode', () => {
    it('valid username', () => {
      b.url(`${editURL}/sandbox`);
      b.waitForDisplayed('#compass');

      expect('#center').to.be.visible();
      expect('#vline').to.be.visible();
      expect('#hline').to.be.visible();
      expect('.ic-workspace-button').to.be.visible;
      expect('.ic-help-button').to.be.visible;
      expectCompassStructure();
    });

    it('invalid code and invalid username', () => {
      b.url('http://localhost:8080/compass/edit/12345/,,,');
      b.waitForDisplayed('#ic-modal');

      expect('#ic-modal-body').to.have.text(/Your code is not valid/);
      expect('#ic-modal-body').to.have.text(/You will be redirected/);

      b.click('#ic-modal-confirm');
      b.waitForDisplayed('#ic-landing');
      expect(b.getUrl()).to.equal('http://localhost:8080/');
    });

    it('with editCode for view-only mode', () => {
      b.url(`http://localhost:8080/compass/view/${editCode}/sandbox`);
      b.waitForDisplayed('#ic-modal');

      expect('#ic-modal-body').to.have.text(/Workspace not found/);

      b.click('#ic-modal-confirm');
      b.waitForDisplayed('#ic-landing');

      expect(b.getUrl()).to.equal('http://localhost:8080/');
    });

    describe('username input', () => {
      beforeEach(() => {
        b.url(editURL);
        b.waitForDisplayed('#ic-modal');
      });

      it('bad username', () => {
        expect('#ic-modal-body').to.have.text(/Welcome/);
        b.setValue('#ic-modal-input', 'sandbox2');
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#ic-toast');
        expect('#ic-toast').to.have.text(/Username must be fewer/);
      });

      it('missing username', () => {
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#ic-toast');
        expect('#ic-toast').to.have.text(/You can't leave this empty/);
      });

      it('valid username', () => {
        b.setValue('#ic-modal-input', 'sandbox');
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#compass');
        expect('#center').to.be.visible();
        expect('#vline').to.be.visible();
        expect('#hline').to.be.visible();
        expect('.ic-workspace-button').to.be.visible;
        expect('.ic-help-button').to.be.visible;
      });
    });
  });
});
