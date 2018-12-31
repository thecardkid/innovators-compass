const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup, menuActions, selectSubmenuOption } = require('./utils');

const expectNumUsers = (expected) => {
  // TODO refactor this using submenuActions
  b.click('button.ic-workspace-button');
  b.waitForVisible('div.ic-workspace-menu');
  b.moveTo(b.elements('div.has-more').value[2].ELEMENT, 10, 10);
  b.waitForVisible('div.ic-users-submenu');
  expect('div.ic-user').to.have.count(expected);
  b.click('button.ic-workspace-button');
};

describe('collaboration', () => {
  let tabs = {};

  beforeAll(() => {
    setup();
    tabs.webdriverio = b.getCurrentTabId();
    const url = b.getUrl().substring(0, 43);

    b.newWindow(`${url}/friendo`, 'friendo', 'width=2000,height=2000');
    b.setViewportSize({ width: 2000, height: 2000 });
    b.waitForVisible('#compass');
    b.pause(1000);
    tabs.friendo = b.getCurrentTabId();
  });

  describe('continuous edit operations', () => {
    it('friendo creates a note', () => {
      b.switchTab(tabs.friendo);
      b.keys(['n']);
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text .ql-editor', 'Friendo\'s note');
      b.click('button[name=ship]').pause(200);
      expect('div.ic-sticky-note').to.have.count(1);
    });

    it('webdriverio sees the note', () => {
      b.switchTab(tabs.webdriverio);
      expect('div.ic-sticky-note').to.have.count(1);
      expect('#note0').to.have.text(/Friendo's note/);
    });

    it('webdriverio drags the note and friendo sees the drag', () => {
      b.switchTab(tabs.friendo);
      const oldPos = b.getLocation('#note0');
      b.switchTab(tabs.webdriverio);
      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0).pause(100);
      b.moveToObject('#note0', 210, 210);
      b.buttonUp(0).pause(100);

      b.switchTab(tabs.friendo);
      const newPos = b.getLocation('#note0');
      expect(newPos.x).to.not.equal(oldPos.x);
      expect(newPos.y).to.not.equal(oldPos.y);
    });

    it('friendo makes an edit and webdriverio sees edit', () => {
      b.switchTab(tabs.friendo);
      b.doubleClick('#note0').pause(100);
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text .ql-editor', 'edit');
      b.click('button[name=ship]');
      b.pause(500);

      b.switchTab(tabs.webdriverio);
      expect('#note0').to.have.text(/edit/);
    });

    it('webdriverio +1 the note', () => {
      b.switchTab(tabs.webdriverio);
      b.moveToObject('#note0', 20, 20);
      expect('.ic-upvote').to.be.visible();
      expect('.ic-upvote').to.have.text(/\+1/);
      b.click('.ic-upvote');
      b.click('.ic-upvote');
      expect('.ic-upvote').to.have.text(/\+2/);

      b.switchTab(tabs.friendo);
      expect('.ic-upvote').to.have.count(1);
      expect('.ic-upvote').to.have.text(/\+2/);
    });
  });

  describe('logouts', () => {
    it('webdriverio logs out and friendo sees only 1 user', () => {
      b.switchTab(tabs.webdriverio);
      b.url('http://localhost:8080/');

      b.switchTab(tabs.friendo);
      expectNumUsers(1);
    });

    it('webdriverio logs in and both see 2 users', () => {
      b.switchTab(tabs.webdriverio);
      b.back();
      b.waitForVisible('button.ic-workspace-button');
      expectNumUsers(2);

      b.switchTab(tabs.friendo);
      expectNumUsers(2);
    });
  });

  describe('draft mode', () => {
    it('other users do not see drafts', () => {
      b.switchTab(tabs.webdriverio);
      b.moveToObject('body', 300, 200);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text .ql-editor', 'webdriverio draft');
      b.click('button[name=draft]').pause(200);
      expect('div.ic-sticky-note').to.have.count(2);
      expect('.draft').to.have.count(1);

      b.switchTab(tabs.friendo);
      expect('div.ic-sticky-note').to.have.count(1);
      expect('.draft').to.have.count(0);
    });

    it('notes submitted by others still show up while in draft mode', () => {
      b.switchTab(tabs.friendo);
      b.moveToObject('body', 300, 600);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text .ql-editor', 'note while in draft');
      b.click('button[name=ship]');
      b.waitForVisible('#note1');
      expect('.ic-sticky-note').to.have.count(2);
      expect('.draft').to.have.count(0);

      b.switchTab(tabs.webdriverio);
      expect('.ic-sticky-note').to.have.count(3);
      expect('.draft').to.have.count(1);
    });

    it('submitting a draft makes it visible to others', () => {
      b.switchTab(tabs.webdriverio);
      b.click('#note0 div.contents button.submit');
      b.pause(200);
      expect('#note2').to.have.text(/webdriverio draft/);

      b.switchTab(tabs.friendo);
      expect('.ic-sticky-note').to.have.count(3);
    });
  });

  describe('bulk edit mode', () => {
    it('deleting a note that is being edited by a user removes it from that user\'s screen', () => {
      b.switchTab(tabs.webdriverio);
      selectSubmenuOption(menuActions.bulkMode);
      b.waitForVisible('#ic-visual-toolbar');
      b.click('#note0');
      b.click('#note2');

      b.switchTab(tabs.friendo);
      selectSubmenuOption(menuActions.bulkMode);
      b.waitForVisible('#ic-visual-toolbar');
      b.click('#note2');
      b.click('#ic-bulk-delete');
      b.waitForVisible('#ic-modal');
      b.click('#ic-modal-confirm');
      b.pause(1000);
      expect('.ic-sticky-note').to.have.count(2);

      b.switchTab(tabs.webdriverio);
      expect('.ic-sticky-note').to.have.count(2);
      // #note0 is still selected
      expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(40,138,255)');
      // #note1 is still not selected
      expect(b.getCssProperty('#note1', 'border-color').value).to.equal('rgb(0,0,0)');
    });
  });

  describe('compass delete', () => {
    it('user who performs delete action gets redirected to home page', () => {
      b.switchTab(tabs.webdriverio);
      cleanup();
      expect(b.getUrl()).to.equal('http://localhost:8080/');
    });

    it('any other user in that deleted workspace also gets redirected to home page', () => {
      b.switchTab(tabs.friendo);
      expect('#ic-modal').to.be.visible();
      expect('#ic-modal').to.have.text(/redirected/);
      b.click('#ic-modal-confirm');
      b.pause(500);
      expect(b.getUrl()).to.equal('http://localhost:8080/');
    });
  });
});
