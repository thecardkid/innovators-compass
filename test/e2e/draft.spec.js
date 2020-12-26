const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup } = require('./utils');
const DOG_PHOTO_LINK = 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi';

describe('draft mode', () => {
  beforeAll(() => {
    setup(b);
    const coords = [{ x: 400, y: 200 }, { x: 500, y: 200 }];
    for (let i = 0; i < coords.length; i++) {
      let p = coords[i];
      b.pause(100);
      $('body').moveTo(p.x, p.y);
      b.buttonPress
      // b.doDoubleClick();
      $('#ic-note-form').waitForDisplayed({ timeout: 1000 });
      $('#ic-form-text .ql-editor').setValue('This is a note');
      $('button[name=ship]').click();
      b.pause(500);
    }
  });

  afterAll(cleanup);

  describe('text draft', () => {
    it('create', () => {
      $('body').moveTo(200, 500).doubleClick();
      // b.doDoubleClick();
      b.waitForDisplayed('#ic-note-form');
      b.setValue('#ic-form-text .ql-editor', 'draft 0');
      b.click('button[name=draft]');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(3);
      expect('.draft').to.have.count(1);
      expect(b.getCssProperty('.draft div.contents', 'background-color').value).to.equal('rgba(128,128,128,1)');
    });

    it('form has correct heading', () => {
      $('#note0').moveTo(10, 10);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-note-form');
      expect('h1.title').to.have.text(/Edit this draft/);
      expect('.ic-form-palette').to.not.be.visible();
    });

    it('can edit draft', () => {
      b.setValue('#ic-form-text .ql-editor', 'Edited draft');
      b.click('button[name=ship]');
      b.pause(200);
      expect('#note0').to.have.text(/Edited draft/);
    });

    it('can drag draft', () => {
      const oldPos = b.getLocation('#note0');
      $('#note0').moveTo(10, 10);
      b.buttonDown(0);
      $('#note0').moveTo(-40, -40);
      b.buttonUp(0);
      const newPosition = b.getLocation('#note0');

      expect(oldPos.x - newPosition.x).to.equal(50);
      expect(oldPos.y - newPosition.y).to.equal(50);
    });

    describe('can still edit non-draft', () => {
      it('form has correct title and does not have draft button', () => {
        $('#note1').moveTo(10, 10);
        b.doDoubleClick();
        b.waitForDisplayed('#ic-note-form');
        expect('h1.title').to.have.text(/Edit this note/);
        expect('button[name=draft]').to.not.be.visible();
      });

      it('can make edit', () => {
        b.setValue('#ic-form-text .ql-editor', 'Edited note');
        b.click('button[name=ship]');
        expect('#note1').to.have.text(/Edited note/);
      });

      it('can drag', () => {
        const oldPos = b.getLocation('#note1');
        $('#note1').moveTo(10, 10);
        b.buttonDown(0);
        $('#note1').moveTo(30, 30);
        b.buttonUp(0);
        const newPosition = b.getLocation('#note1');

        expect(oldPos.x - newPosition.x).to.equal(-20);
        expect(oldPos.y - newPosition.y).to.equal(-20);
      });
    });
  });

  describe('image draft', () => {
    it('image form should render correctly', () => {
      $('body').moveTo(400, 500);
      b.keys('Shift');
      b.doDoubleClick();
      b.keys('Shift');
      b.waitForDisplayed('#ic-image-form');
      b.setValue('#ic-form-text', DOG_PHOTO_LINK);
      b.click('button[name=draft]');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(4);
      expect('.draft').to.have.count(2);
      expect('.ic-img').to.have.count(1);
    });

    it('renders draft with image', () => {
      expect('#note1 div.contents img').to.be.there();
      expect('#note1 div.contents button.submit').to.be.there();
    });

    it('edit image draft', () => {
      $('div.ic-img').moveTo(20, 20);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-image-form');
      expect('h1.title').to.have.text(/Edit photo draft/);
      expect('.ic-form-palette').to.not.be.visible();
      expect('#ic-form-text').to.have.text(DOG_PHOTO_LINK);
      expect('button[name=draft]').to.not.be.visible();
      b.click('button[name=nvm]');
    });

    it('can drag', () => {
      const oldPos = b.getLocation('#note1');
      $('#note1').moveTo(10, 10);
      b.buttonDown(0);
      $('#note1').moveTo(30, 30);
      b.buttonUp(0);
      const newPosition = b.getLocation('#note1');

      expect(oldPos.x - newPosition.x).to.equal(-20);
      expect(oldPos.y - newPosition.y).to.equal(-20);
    });
  });

  describe('doodle draft', () => {
    it('create doodle draft', () => {
      b.keys('Alt');
      b.keys('d');
      b.keys('Alt');
      b.waitForDisplayed('#ic-doodle-form');
      $('#ic-doodle').moveTo(155, 75);
      b.buttonDown(0);
      $('#ic-doodle').moveTo(255, 175);
      b.buttonUp(0);
      b.pause(1000);
      b.click('button[name=draft]');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(5);
      expect('.draft').to.have.count(3);
      expect('.ic-img').to.have.count(2);
      expect(b.getAttribute('#note2 div.contents img', 'src')).to.contain('data:image/png;base64');
    });

    it('cannot edit doodle', () => {
      $('#note2').moveTo(10, 10);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-toast span');
      expect(b.getAttribute('#ic-toast span', 'class')).to.equal('warning');
      expect('#ic-toast span').to.have.text(/Sketches cannot be edited/);
    });

    it('can drag', () => {
      const oldPos = b.getLocation('#note2');
      $('#note2').moveTo(10, 10);
      b.buttonDown(0);
      $('#note2').moveTo(30, 30);
      b.buttonUp(0);
      const newPosition = b.getLocation('#note2');

      expect(oldPos.x - newPosition.x).to.equal(-20);
      expect(oldPos.y - newPosition.y).to.equal(-20);
    });
  });

  it('drafts are saved in local storage', () => {
    b.refresh().pause(5000);
    b.waitForDisplayed('.ic-sticky-note');
    expect('.ic-sticky-note').to.have.count(5);
    expect('.draft').to.have.count(3);
  });

  describe('submit drafts', () => {
    it('submit text note', () => {
      $('#note0 div.contents button.submit').click();
      b.pause(100);
      expect('.ic-sticky-note').to.have.count(5);
      expect('.draft').to.have.count(2);
      expect('.ic-img').to.have.count(2);
    });

    it('submit image note', () => {
      b.click('#note0 div.contents button.submit');
      b.pause(100);
      expect('.ic-sticky-note').to.have.count(5);
      expect('.draft').to.have.count(1);
      expect('.ic-img').to.have.count(2);
    });
  });

  describe('others', () => {
    it('compact mode does not discard drafts', () => {
      b.keys(['Shift', '2', 'Shift']);
      expect('.compact').to.have.count(5);
    });

    describe('bulk edit mode', () => {
      it('does not discard drafts', () => {
        b.keys(['Shift', '3', 'Shift']);
        expect('.ic-sticky-note').to.have.count(5);
      });

      it('cannot select draft in bulk mode', () => {
        b.click('#ic-toast');
        $('#note4').moveTo(50, 50); // drafts come last in bulk mode
        b.leftClick();
        b.waitForDisplayed('#ic-toast');
        expect('#ic-toast').to.have.text(/Cannot select drafts/);
        b.click('#ic-toast');
      });

      it('cannot submit drafts in bulk mode', () => {
        b.click('#note4 div.contents button.submit');
        b.waitForDisplayed('#ic-toast');
        expect('#ic-toast').to.have.text(/Cannot select drafts/);
      });
    });

    it('has correct prompt when deleting draft', () => {
      b.keys(['Shift', '1', 'Shift']); // enter standard mode
      $('#note0').moveTo(164, 2); // delete the doodle
      b.leftClick();
      b.waitForDisplayed('#ic-modal');
      expect('#ic-modal-body').to.have.text(/discard this draft/);
    });

    it('can discard draft', () => {
      b.click('#ic-modal-confirm');
      b.pause(200);
      expect('.ic-sticky-note').to.have.count(4);
      expect('.draft').to.have.count(0);
    });
  });
});
