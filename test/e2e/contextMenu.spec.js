const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup } = require('./utils');
const imageUrl = 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi';

describe('context menus', () => {
  beforeAll(setup);

  afterAll(cleanup);

  const x = 100, y = 200;

  beforeEach(() => {
    b.moveToObject('#note0', 10, 10);
    b.rightClick();
    b.waitForVisible('.context-menu');
  });

  afterEach(() => {
    b.moveToObject('body', 800, 800);
    b.leftClick();
  });

  describe('text note context menu', () => {
    beforeAll(() => {
      b.moveToObject('body', x, y);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text .ql-editor', 'text note');
      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(1);
    });

    it('correct options enabled', () => {
      expect('.ic-menu-item').to.have.count(7);
      expect('.ic-menu-item.disabled').to.have.count(1);
    });

    it('clicking away dismisses context menu', () => {
      b.click('div#ideas');
      expect('.context-menu').to.not.be.visible();
    });

    it('edit', () => {
      b.elements('.ic-menu-item').value[0].click();
      expect('#ic-note-form').to.be.visible();
      expect('#ic-form-text').to.have.text(/text note/);
      b.click('button[name=nvm]');
    });

    it('upvote', () => {
      b.elements('.ic-menu-item').value[1].click();
      expect('#note0 .ic-upvote').to.be.visible();
      expect('#note0 .ic-upvote').to.have.text(/\+1/);
    });

    it('ignore view image option', () => {
      b.elements('.ic-menu-item').value[3].click();
      b.pause(200);
      expect('#ic-modal-image').to.not.be.visible();
    });

    it('focus', () => {
      b.elements('.ic-menu-item').value[4].click();
      expect(b.getCssProperty('#note0', 'z-index').value).to.equal(3);
    });

    it('select', () => {
      b.elements('.ic-menu-item').value[5].click();
      expect('#ic-visual-toolbar').to.be.visible();
      expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(40,138,255)');
    });

    it('delete', () => {
      b.elements('.ic-menu-item').value[6].click();
      expect('#ic-modal').to.be.visible();
      expect('#ic-modal').to.be.have.text(/Are you sure/);
      b.click('#ic-modal-confirm');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(0);
    });
  });

  describe('image note context menu', () => {
    beforeAll(() => {
      b.moveToObject('body', x, y);
      b.keys('Shift');
      b.doDoubleClick();
      b.keys('Shift');
      b.waitForVisible('#ic-image-form');
      b.setValue('#ic-form-text', imageUrl);
      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(1);
    });

    it('correct options enabled', () => {
      expect('.ic-menu-item').to.have.count(7);
      expect('.ic-menu-item.disabled').to.have.count(0);
    });

    it('edit', () => {
      b.elements('.ic-menu-item').value[0].click();
      expect('#ic-image-form').to.be.visible();
      expect('#ic-form-text').to.have.text(/cesarsway/);
      b.click('button[name=nvm]');
    });

    it('upvote', () => {
      b.elements('.ic-menu-item').value[1].click();
      expect('#note0 .ic-upvote').to.be.visible();
      expect('#note0 .ic-upvote').to.have.text(/\+1/);
    });

    it('view image', () => {
      b.elements('.ic-menu-item').value[3].click();
      b.pause(200);
      expect('#ic-modal-image').to.be.visible();
      expect(b.getAttribute('#ic-modal-image img', 'src')).to.contain('cesarsway');
      b.moveToObject('#ic-modal-image img', -10, -10);
      b.leftClick();
      expect('#ic-modal-image').to.not.be.visible();
    });

    it('focus', () => {
      b.elements('.ic-menu-item').value[4].click();
      expect(b.getCssProperty('#note0', 'z-index').value).to.equal(3);
    });

    it('select', () => {
      b.elements('.ic-menu-item').value[5].click();
      expect('#ic-visual-toolbar').to.be.visible();
      expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(40,138,255)');
    });

    it('delete', () => {
      b.elements('.ic-menu-item').value[6].click();
      expect('#ic-modal').to.be.visible();
      expect('#ic-modal').to.be.have.text(/Are you sure/);
      b.click('#ic-modal-confirm');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(0);
    });
  });

  describe('doodle note context menu', () => {
    beforeAll(() => {
      b.moveToObject('body', x, y);
      b.keys('Alt');
      b.doDoubleClick();
      b.keys('Alt');
      b.waitForVisible('#ic-doodle-form');

      // draw doodle
      b.moveToObject('#ic-doodle', 155, 75);
      b.buttonDown(0);
      b.moveToObject('#ic-doodle', 255, 175);
      b.buttonUp(0);
      b.pause(200);

      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(1);
    });

    it('correct options enabled', () => {
      expect('.ic-menu-item').to.have.count(7);
      expect('.ic-menu-item.disabled').to.have.count(2);
    });

    it('edit is disabled', () => {
      b.elements('.ic-menu-item').value[0].click();
      expect('#ic-toast').to.be.visible();
      expect('#ic-toast').to.have.text(/cannot be edited/);
    });

    it('upvote', () => {
      b.elements('.ic-menu-item').value[1].click();
      expect('#note0 .ic-upvote').to.be.visible();
      expect('#note0 .ic-upvote').to.have.text(/\+1/);
    });

    it('view sketch', () => {
      b.elements('.ic-menu-item').value[3].click();
      b.pause(200);
      expect('#ic-modal-image').to.be.visible();
      expect(b.getAttribute('#ic-modal-image img', 'src')).to.include('data:image/png;base64');
      b.moveToObject('#ic-modal-image img', -10, -10);
      b.leftClick();
      expect('#ic-modal-image').to.not.be.visible();
    });

    it('focus', () => {
      b.elements('.ic-menu-item').value[4].click();
      expect(b.getCssProperty('#note0', 'z-index').value).to.equal(3);
    });

    it('select', () => {
      b.elements('.ic-menu-item').value[5].click();
      expect('#ic-visual-toolbar').to.be.visible();
      expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(40,138,255)');
    });

    it('delete', () => {
      b.elements('.ic-menu-item').value[6].click();
      expect('#ic-modal').to.be.visible();
      expect('#ic-modal').to.be.have.text(/Are you sure/);
      b.click('#ic-modal-confirm');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(0);
    });
  });

  describe('text draft context menu', () => {
    beforeAll(() => {
      b.moveToObject('body', x, y);
      b.doDoubleClick();
      b.waitForVisible('#ic-note-form');
      b.setValue('#ic-form-text .ql-editor', 'text note');
      b.click('button[name=draft]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(1);
    });

    it('correct options enabled', () => {
      expect('.ic-menu-item').to.have.count(7);
      expect('.ic-menu-item.disabled').to.have.count(3);
    });

    it('edit', () => {
      b.elements('.ic-menu-item').value[0].click();
      expect('#ic-note-form').to.be.visible();
      expect('#ic-form-text').to.have.text(/text note/);
      b.click('button[name=nvm]');
    });

    it('upvote disabled', () => {
      b.elements('.ic-menu-item').value[1].click();
      expect('#note0 .ic-upvote').to.not.be.visible();
    });

    it('view image disabled', () => {
      b.elements('.ic-menu-item').value[3].click();
      b.pause(200);
      expect('#ic-modal-image').to.not.be.visible();
    });

    it('focus', () => {
      b.elements('.ic-menu-item').value[4].click();
      expect(b.getCssProperty('#note0', 'z-index').value).to.equal(3);
    });

    it('select disabled', () => {
      b.elements('.ic-menu-item').value[5].click();
      expect('#ic-visual-toolbar').to.not.be.visible();
      expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(0,0,0)');
    });

    it('discard', () => {
      b.elements('.ic-menu-item').value[6].click();
      expect('#ic-modal').to.be.visible();
      expect('#ic-modal').to.be.have.text(/Are you sure/);
      b.click('#ic-modal-confirm');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(0);
    });
  });

  describe('image draft context menu', () => {
    beforeAll(() => {
      b.moveToObject('body', x, y);
      b.keys('Shift');
      b.doDoubleClick();
      b.keys('Shift');
      b.waitForVisible('#ic-image-form');
      b.setValue('#ic-form-text', imageUrl);
      b.click('button[name=draft]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(1);
    });

    it('correct options enabled', () => {
      expect('.ic-menu-item').to.have.count(7);
      expect('.ic-menu-item.disabled').to.have.count(2);
    });

    it('edit', () => {
      b.elements('.ic-menu-item').value[0].click();
      expect('#ic-image-form').to.be.visible();
      expect('#ic-form-text').to.have.text(/cesarsway/);
      b.click('button[name=nvm]');
    });

    it('upvote disabled', () => {
      b.elements('.ic-menu-item').value[1].click();
      expect('#note0 .ic-upvote').to.not.be.visible();
    });

    it('view image', () => {
      b.elements('.ic-menu-item').value[3].click();
      b.pause(200);
      expect('#ic-modal-image').to.be.visible();
      expect(b.getAttribute('#ic-modal-image img', 'src')).to.contain('cesarsway');
      b.moveToObject('#ic-modal-image img', -10, -10);
      b.leftClick();
      expect('#ic-modal-image').to.not.be.visible();
    });

    it('focus', () => {
      b.elements('.ic-menu-item').value[4].click();
      expect(b.getCssProperty('#note0', 'z-index').value).to.equal(3);
    });

    it('select disabled', () => {
      b.elements('.ic-menu-item').value[5].click();
      expect('#ic-visual-toolbar').to.not.be.visible();
      expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(0,0,0)');
    });

    it('discard', () => {
      b.elements('.ic-menu-item').value[6].click();
      expect('#ic-modal').to.be.visible();
      expect('#ic-modal').to.be.have.text(/Are you sure/);
      b.click('#ic-modal-confirm');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(0);
    });
  });

  describe('doodle note context menu', () => {
    beforeAll(() => {
      b.moveToObject('body', x, y);
      b.keys('Alt');
      b.doDoubleClick();
      b.keys('Alt');
      b.waitForVisible('#ic-doodle-form');

      // draw doodle
      b.moveToObject('#ic-doodle', 155, 75);
      b.buttonDown(0);
      b.moveToObject('#ic-doodle', 255, 175);
      b.buttonUp(0);
      b.pause(200);

      b.click('button[name=draft]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(1);
    });

    it('correct options enabled', () => {
      expect('.ic-menu-item').to.have.count(7);
      expect('.ic-menu-item.disabled').to.have.count(4);
    });

    it('edit is disabled', () => {
      b.elements('.ic-menu-item').value[0].click();
      expect('#ic-toast').to.be.visible();
      expect('#ic-toast').to.have.text(/cannot be edited/);
    });

    it('upvote disabled', () => {
      b.elements('.ic-menu-item').value[1].click();
      expect('#note0 .ic-upvote').to.not.be.visible();
    });

    it('view sketch', () => {
      b.elements('.ic-menu-item').value[3].click();
      b.pause(200);
      expect('#ic-modal-image').to.be.visible();
      expect(b.getAttribute('#ic-modal-image img', 'src')).to.include('data:image/png;base64');
      b.moveToObject('#ic-modal-image img', -10, -10);
      b.leftClick();
      expect('#ic-modal-image').to.not.be.visible();
    });

    it('focus', () => {
      b.elements('.ic-menu-item').value[4].click();
      expect(b.getCssProperty('#note0', 'z-index').value).to.equal(3);
    });

    it('select disabled', () => {
      b.elements('.ic-menu-item').value[5].click();
      expect('#ic-visual-toolbar').to.not.be.visible();
      expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(0,0,0)');
    });

    it('discard', () => {
      b.elements('.ic-menu-item').value[6].click();
      expect('#ic-modal').to.be.visible();
      expect('#ic-modal').to.be.have.text(/Are you sure/);
      b.click('#ic-modal-confirm');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(0);
    });
  });
});
