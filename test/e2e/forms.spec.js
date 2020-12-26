const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
const path = require('path');
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup, selectColor } = require('./utils');
const imageUrl = 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi';
const driveUrl = 'https://drive.google.com/file/d/12345/view?usp=sharing';
const expectedDriveUrl = 'https://drive.google.com/thumbnail?id=12345';

describe('forms', () => {
  beforeAll(setup);

  afterAll(cleanup);

  describe('text', () => {
    it('create', () => {
      b.moveToObject('body', 100, 200);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-note-form');
      b.setValue('#ic-form-text .ql-editor', 'text note');
      selectColor('#FFFFCC');
      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(1);
      expect('#note0').to.have.text(/text note/);
      const { x, y } = b.getLocation('#note0');
      expect(x).to.equal(100);
      expect(y).to.equal(200);
      expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal('rgba(255,255,204,1)');
    });

    it('edit', () => {
      b.moveToObject('#note0', 10, 1);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-note-form');
      expect('#ic-form-text .ql-editor').to.have.text('text note');
      selectColor('#FFCCFF');
      b.setValue('#ic-form-text .ql-editor', 'edited note');
      b.click('button[name=ship]');
      b.pause(200);
      expect('#note0').to.have.text(/edited note/);
      expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal('rgba(255,204,255,1)');
    });

    it('edit: can\'t submit empty note', () => {
      b.moveToObject('#note0', 10, 1);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-note-form');
      b.setValue('#ic-form-text .ql-editor', '');
      b.click('button[name=ship]');
      b.pause(200);
      expect('#ic-form-text').to.be.visible();
      expect('#note0').to.have.text(/edited note/);
      b.click('button[name=nvm]');
    });

    it('drag', () => {
      b.moveToObject('#note0', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note0', -40, -40);
      b.buttonUp(0);
      const { x, y } = b.getLocation('#note0');
      expect(100 - x).to.equal(50);
      expect(200 - y).to.equal(50);
    });
  });

  describe('image', () => {
    const xoffset = 100;
    const yoffset = 500;

    it('shows form', () => {
      b.moveToObject('body', xoffset, yoffset);
      b.keys('Shift');
      b.doDoubleClick();
      b.keys('Shift');
      b.waitForDisplayed('#ic-image-form');
      expect('.ic-form-palette').to.be.visible();
    });

    it('can toggle alt text', () => {
      expect('#ic-image-alt-text').to.not.be.visible();
      b.click('#toggle-alt');
      expect('#ic-image-alt-text').to.be.visible();
      b.click('#toggle-alt');
      expect('#ic-image-alt-text').to.not.be.visible();
    });

    it('create', () => {
      b.setValue('#ic-form-text', imageUrl);
      selectColor('#FFFFCC');
      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(2);
      const { x, y } = b.getLocation('#note1');
      expect(x).to.equal(xoffset);
      expect(y).to.equal(yoffset);
      expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal('rgba(255,255,204,1)');
    });

    it('editing an image without alt text does not show alt text field', () => {
      b.moveToObject('#note1', 10, 1);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-image-form');
      expect('#ic-image-alt-text').to.not.be.visible();
      b.click('button[name=nvm]');
    });

    it('edit', () => {
      b.moveToObject('#note1', 10, 1);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-image-form');
      expect('.ic-form-palette').to.be.visible();
      expect('#ic-form-text').to.have.text(imageUrl);
      selectColor('#FFCCFF');
      b.click('#toggle-alt');
      b.setValue('#ic-image-alt-text', 'alternative text');
      b.click('button[name=ship]');
      expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal('rgba(255,204,255,1)');
    });

    it('alt tag is there', () => {
      expect(b.getAttribute('#note1 div.contents img', 'alt')).to.equal('alternative text');
    });

    it('converts drive link to thumbnail', () => {
      b.moveToObject('#note1', 10, 1);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-image-form');
      b.setValue('#ic-form-text', driveUrl);
      b.pause(200);
      expect('#ic-form-text').to.have.text(expectedDriveUrl);
      b.click('button[name=nvm]');
    });

    it('drag', () => {
      b.moveToObject('#note1', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note1', 40, 40);
      b.buttonUp(0);
      const { x, y } = b.getLocation('#note1');
      expect(xoffset - x).to.equal(-30);
      expect(yoffset - y).to.equal(-30);
    });

    describe('s3 upload', () => {
      it('file too large', () => {
        b.moveToObject('body', 700, 700);
        b.keys('Shift');
        b.doDoubleClick();
        b.keys('Shift');
        b.waitForDisplayed('#ic-image-form');
        expect('input[name=s3-uploader]').to.be.there();

        b.chooseFile('input[name=s3-uploader]', path.join('./test/e2e/files/toolarge.jpg'));
        b.pause(500);
        expect('#ic-toast').to.be.visible();
        expect('#ic-toast').to.have.text(/cannot be larger than 1MB/);
      });

      it('upload success', () => {
        b.chooseFile('input[name=s3-uploader]', path.join('./test/e2e/files/shouldpass.jpg'));
        b.waitForDisplayed('div.preview img');
        expect(b.getText('#ic-form-text')).to.include('https://s3.us-east-2.amazonaws.com/innovatorscompass');
        b.click('button[name=nvm]');
      });
    });
  });

  describe('doodle', () => {
    const xoffset = 300;
    const yoffset = 500;

    it('create', () => {
      b.moveToObject('body', xoffset, yoffset);
      b.keys('Alt');
      b.doDoubleClick();
      b.keys('Alt');
      b.waitForDisplayed('#ic-doodle-form');
      expect('.ic-form-palette').to.be.visible();

      // draw doodle
      b.moveToObject('#ic-doodle', 155, 75);
      b.buttonDown(0);
      b.moveToObject('#ic-doodle', 255, 175);
      b.buttonUp(0);
      b.pause(200);

      selectColor('#FFFFCC');
      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(3);
      const { x, y } = b.getLocation('#note2');
      expect(x).to.equal(xoffset);
      expect(y).to.equal(yoffset);
      expect(b.getAttribute('#note2 div.ic-img img', 'src')).to.contain('data:image/png;base64');
      expect(b.getCssProperty('#note2 div.contents', 'background-color').value).to.equal('rgba(255,255,204,1)');
    });

    it('edit', () => {
      b.moveToObject('#note2', 10, 1);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-toast');
      expect('#ic-toast').to.have.text(/Sketches cannot be edited/);
      b.click('#ic-toast');
    });

    it('drag', () => {
      b.moveToObject('#note2', 10, 10);
      b.buttonDown(0);
      b.moveToObject('#note2', 10, 40);
      b.buttonUp(0);
      const { x, y } = b.getLocation('#note2');
      expect(xoffset - x).to.equal(0);
      expect(yoffset - y).to.equal(-30);
    });
  });

  describe('form switching', () => {
    it('text to image', () => {
      b.moveToObject('body', 500, 500);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-note-form');
      expect('.switch-form').to.have.count(2);
      b.click('.switch-image');
      expect('#ic-note-form').to.not.be.visible();
      expect('#ic-image-form').to.be.visible();
    });

    it('image to doodle', () => {
      b.click('.switch-doodle');
      expect('#ic-image-form').to.not.be.visible();
      expect('#ic-doodle-form').to.be.visible();
    });

    it('doodle to text', () => {
      b.click('.switch-text');
      expect('#ic-doodle-form').to.not.be.visible();
      expect('#ic-note-form').to.be.visible();
    });

    it('text to doodle', () => {
      b.click('.switch-doodle');
      expect('#ic-text-form').to.not.be.visible();
      expect('#ic-doodle-form').to.be.visible();
    });

    it('doodle to image', () => {
      b.click('.switch-image');
      expect('#ic-doodle-form').to.not.be.visible();
      expect('#ic-image-form').to.be.visible();
    });

    it('image to text', () => {
      b.click('.switch-text');
      expect('#ic-image-form').to.not.be.visible();
      expect('#ic-note-form').to.be.visible();
      b.click('button[name=nvm]');
    });

    it('switching form maintains note position', () => {
      b.moveToObject('body', 500, 500);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-note-form');
      expect('.switch-form').to.have.count(2);
      b.click('.switch-image');
      b.setValue('#ic-form-text', imageUrl);
      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(4);

      const { x, y } = b.getLocation('#note3');
      expect(x).to.equal(500);
      expect(y).to.equal(500);
    });

    it('switching form after changing note color retains that color', () => {
      b.moveToObject('body', 600, 600);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-note-form');
      selectColor('#FFCCFF');
      expect(b.getCssProperty('#ic-form-text', 'background-color').value).to.equal('rgba(255,204,255,1)');

      b.click('.switch-doodle');
      expect(b.getCssProperty('#ic-doodle', 'background-color').value).to.equal('rgba(255,204,255,1)');

      b.click('.switch-image');
      expect(b.getCssProperty('#ic-form-text', 'background-color').value).to.equal('rgba(255,204,255,1)');
      b.click('#toggle-alt');
      b.waitForDisplayed('#ic-image-alt-text');
      expect(b.getCssProperty('#ic-image-alt-text', 'background-color').value).to.equal('rgba(255,204,255,1)');

      b.setValue('#ic-form-text', imageUrl);
      b.click('button[name=ship]');
      b.pause(200);
      expect('div.ic-sticky-note').to.have.count(5);
      expect(b.getCssProperty('#note4 div.contents', 'background-color').value).to.equal('rgba(255,204,255,1)');
    });

    it('editing image does not allow switching', () => {
      b.moveToObject('#note3', 10, 10);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-image-form');
      expect('.switch-form').to.have.count(0);
      b.click('button[name=nvm]');
    });

    it('editing text does not allow switching', () => {
      b.moveToObject('#note0', 10, 10);
      b.doDoubleClick();
      b.waitForDisplayed('#ic-note-form');
      expect('.switch-form').to.have.count(0);
      b.click('button[name=nvm]');
    });
  });

  describe('clicking backdrop closes form', () => {
    it('closes text form', () => {
      b.keys('n');
      b.waitForDisplayed('#ic-note-form');
      b.moveToObject('#ic-note-form', -20, -20);
      b.leftClick();
      expect('#ic-note-form').to.not.be.visible();
    });

    it('closes image form', () => {
      b.keys('i');
      b.waitForDisplayed('#ic-image-form');
      b.moveToObject('#ic-image-form', -20, -20);
      b.leftClick();
      expect('#ic-image-form').to.not.be.visible();
    });

    it('closes doodle form', () => {
      b.keys('d');
      b.waitForDisplayed('#ic-doodle-form');
      b.moveToObject('#ic-doodle-form', -20, -20);
      b.leftClick();
      expect('#ic-doodle-form').to.not.be.visible();
    });
  });
});
