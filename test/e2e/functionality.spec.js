const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup, switchMode, expectCompassStructure } = require('./utils');

describe('basic functionality', () => {
  beforeAll(setup);

  afterAll(cleanup);

  it('elements are there', () => {
    expect('#vline').to.be.visible();
    expect('#hline').to.be.visible();
    expect('.ic-workspace-button').to.be.visible();
    expect('.ic-help-button').to.be.visible();
    // From test/e2e/utils.js:setup
    expect('#ic-compass-topic').to.have.text(/webdriverio/);
    expect('#center').to.have.text('topic');
    expectCompassStructure();
  });

  describe('key bindings', () => {
    it('new note', () => {
      b.keys('n');
      expect('#ic-note-form').to.be.visible();
      b.click('button[name=ship]');
      expect('#ic-note-form').to.be.visible();
      b.keys('\uE00C'); // ESCAPE
      expect('#ic-note-form').to.not.be.visible();
    });

    it('new doodle', () => {
      b.keys('d');
      expect('#ic-doodle-form').to.be.visible();
      b.keys('\uE00C'); // ESCAPE
      expect('#ic-doodle-form').to.not.be.visible();
    });
  });

  describe('sticky workflow', () => {
    it('create', () => {
      expect('.ic-sticky-note').to.have.count(0);
      b.keys('n');
      b.setValue('#ic-form-text .ql-editor', 'An observation');
      b.click('button[name=ship]').pause(200);
      expect('.ic-sticky-note').to.have.count(1);
      expect('.ic-sticky-note').to.have.text(/An observation/);
    });

    it('edit', () => {
      b.moveToObject('.ic-sticky-note', 5, 5);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-note-form');
      b.setValue('#ic-form-text .ql-editor', 'A principle');
      b.click('button[name=ship]');
      b.pause(200);
      expect('.ic-sticky-note').to.have.text(/A principle/);
    });

    it('drag', () => {
      const oldPos = b.getLocation('#note0');
      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note0', -290, -290);
      b.buttonUp(0);
      const newPosition = b.getLocation('#note0');

      expect(oldPos.x - newPosition.x).to.equal(300);
      expect(oldPos.y - newPosition.y).to.equal(300);
    });

    it('compact mode', () => {
      expect('div.compact').to.have.count(0);
      switchMode('#ic-compact');
      b.pause(300);
      expect('div.compact').to.have.count(1);
      switchMode('#ic-standard');
    });

    describe('delete', () => {
      it('rejecting alert preserves note', () => {
        b.moveToObject('#note0', 74, 2);
        b.leftClick();
        b.waitForDisplayed('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Are you sure/);
        b.click('#ic-modal-cancel');
        expect('div.ic-sticky-note').to.have.count(1);
      });

      it('accepting alert deletes note', () => {
        b.moveToObject('#note0', 74, 2);
        b.leftClick();
        b.waitForDisplayed('#ic-modal');
        b.click('#ic-modal-confirm');
        b.pause(500);
        expect('div.ic-sticky-note').to.have.count(0);
      });
    });
  });

  describe('changing compass center', () => {
    beforeEach(() => {
      b.moveToObject('#center', 10, 10);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-modal');
    });

    it('clearing value and submitting does nothing', () => {
      b.clearElement('#ic-modal-input');
      b.click('#ic-modal-confirm');
      b.pause(200);
      expect('#center').to.have.text(/topic/);
    });

    it('empty submit does nothing', () => {
      b.click('#ic-modal-confirm');
      b.pause(200);
      expect('#center').to.have.text(/topic/);
    });

    it('can change compass center', () => {
      // This is set in the beforeAll(setup) call
      expect(b.getValue('#ic-modal-input')).to.equal('topic');
      expect('#ic-modal-cancel').to.be.visible();

      b.setValue('#ic-modal-input', 'topic2');
      b.click('#ic-modal-confirm');

      b.pause(200);
      expect('#center').to.have.text(/topic2/);
    });
  });

  // Must be run after all tests since, unfortunately,
  // state flows over from one test to another
  describe('really long topic name', () => {
    beforeAll(() => {
      // pretty much copy-pasted from test/e2e/utils:setup. Can't call
      // setup directly because of the long topic name.
      b.url('http://localhost:8080');
      b.waitForDisplayed('body', 1000);
      b.setValue('#compass-center', 'a really long topic name that is definitely over thirty-five characters of text');
      b.setValue('#username', 'sandbox');
      b.click('button[type=submit]');
      b.waitForDisplayed('#ic-modal', 1000);
      // do not email
      b.click('#ic-modal-cancel');
      b.waitForDisplayed('#compass', 1000);
      // set center
      b.waitForDisplayed('#ic-modal');
      browser.setValue('#ic-modal-input', 'center');
      browser.click('#ic-modal-confirm');
      // wait for animation
      browser.pause(2000);
    });

    it('truncates topic name by default', () => {
      expect('#ic-compass-topic').to.be.visible();
      expect('#ic-compass-topic').to.have.text(/\.\.\./);
    });

    it('expands topic on click', () => {
      b.click('#ic-compass-topic');
      expect('#ic-compass-topic').to.have.text(/a really long topic name that is definitely over thirty-five characters of text/);
    });

    it('truncates topic on click', () => {
      b.click('#ic-compass-topic');
      expect('#ic-compass-topic').to.have.text(/\.\.\./);
    });
  });
});
