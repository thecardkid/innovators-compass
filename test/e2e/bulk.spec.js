// const chai = require('chai');
// const chaiWebdriver = require('chai-webdriverio').default;
// chai.use(chaiWebdriver(browser));
//
// const expect = chai.expect;
// const b = browser;
//
// const { setup, cleanup, switchMode, selectColor } = require('./utils');
// const TEXT = 'this is a note',
//     POSITIONS = [ {x: 250, y: 200}, {x: 350, y: 200}, {x: 450, y: 200}, {x: 550, y: 200} ];
//
// const expectHighlighted = (noteId) => {
//   expect(b.getCssProperty(`${noteId} div.contents`, 'background-color').value).to.equal('rgba(204,255,204,1)');
// };
//
// describe('visual mode', () => {
//   beforeAll(() => {
//     setup();
//
//     for (let i = 0; i < POSITIONS.length; i++) {
//       let p = POSITIONS[i];
//       b.moveToObject('body', p.x, p.y);
//       b.doDoubleClick();
//       b.waitForDisplayed('#ic-note-form');
//       b.setValue('#ic-form-text .ql-editor', TEXT);
//       b.click('button[name=ship]');
//       b.pause(500);
//     }
//   });
//
//   afterAll(cleanup);
//
//   it('visual mode toolbar is draggable', () => {
//     expect('#ic-visual-toolbar').to.not.be.there();
//     switchMode('#ic-bulk');
//     b.waitForDisplayed('#ic-visual-toolbar');
//
//     let pos = b.getLocation('#ic-visual-toolbar');
//
//     b.moveToObject('#ic-visual-toolbar', 3, 3);
//     b.buttonDown(0);
//     b.moveToObject('#ic-visual-toolbar', -147, 3);
//     b.buttonUp(0);
//
//     let newPos = b.getLocation('#ic-visual-toolbar');
//     expect(pos.x).to.not.equal(newPos.x);
//   });
//
//   it('escape key switches to normal mode', () => {
//     b.keys('\uE00C'); // ESCAPE
//     expect('#ic-visual-toolbar').to.not.be.visible();
//   });
//
//   it('editing disabled', () => {
//     switchMode('#ic-bulk');
//     b.moveToObject('#note0', 10, 10);
//     b.doDoubleClick();
//     b.waitForDisplayed('#ic-toast span');
//     expect(b.getAttribute('#ic-toast span', 'class')).to.equal('warning');
//     expect('#ic-toast span').to.have.text(/can't make changes/);
//     b.click('#ic-toast span');
//     b.waitForDisplayed('#ic-toast span', 1000, true);
//   });
//
//   describe('renders correctly', () => {
//     beforeAll(() => {
//       switchMode('#ic-standard');
//       switchMode('#ic-bulk');
//       b.waitForDisplayed('#ic-visual-toolbar');
//     });
//
//     it('bulk deleting exits visual mode', () => {
//       b.click('button#ic-bulk-delete');
//       b.waitForDisplayed('#ic-modal');
//       expect('#ic-modal-body').to.have.text(/Are you sure/);
//       b.click('#ic-modal-confirm');
//       expect('#ic-visual-toolbar').to.not.be.visible();
//     });
//   });
//
//   describe('bulk editing', () => {
//     beforeEach(() => {
//       switchMode('#ic-standard');
//       switchMode('#ic-bulk');
//       b.waitForDisplayed('#ic-visual-toolbar');
//     });
//
//     it('sticky note coloring', () => {
//       const background = b.getCssProperty('#note0 div.contents', 'background-color').value;
//
//       b.click('#note0');
//       b.click('#note1');
//       b.pause(200);
//
//       selectColor('#FFCCFF');
//       b.pause(200);
//       expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal('rgba(255,204,255,1)');
//       expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal('rgba(255,204,255,1)');
//
//       selectColor('#CCFFFF');
//       b.pause(500);
//       expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal('rgba(204,255,255,1)');
//       expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal('rgba(204,255,255,1)');
//
//       selectColor('#CCFFFF');
//       b.pause(500);
//       expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal(background);
//       expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal(background);
//
//       b.click('#note0');
//       b.click('#note1');
//     });
//   });
//
//   describe('submitting', () => {
//     beforeEach(() => {
//       switchMode('#ic-standard');
//       switchMode('#ic-bulk');
//       b.waitForDisplayed('#ic-visual-toolbar');
//     });
//
//     it('setup', () => {
//       b.click('#note0');
//       b.click('#note1');
//       b.pause(200);
//       selectColor('#CCFFCC');
//       b.click('#ic-bulk-submit');
//       b.pause(500);
//
//       expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal('rgba(204,255,204,1)');
//       expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal('rgba(204,255,204,1)');
//     });
//
//     it('empty submit does nothing', () => {
//       switchMode('#ic-bulk');
//       b.click('#note0');
//       b.click('#note1');
//       b.click('#ic-bulk-submit');
//       b.pause(1000);
//       expect(b.getCssProperty('#note0 div.contents', 'background-color').value).to.equal('rgba(204,255,204,1)');
//       expect(b.getCssProperty('#note1 div.contents', 'background-color').value).to.equal('rgba(204,255,204,1)');
//     });
//   });
//
//   describe('drag', () => {
//     beforeEach(() => {
//       switchMode('#ic-bulk');
//     });
//
//     afterEach(() => {
//       switchMode('#ic-standard');
//     });
//
//     it('can drag one note', () => {
//       b.click('#note0');
//       const oldPos = b.getLocation('#note0');
//       b.moveToObject('#note0', 10, 10);
//       b.buttonDown(0);
//       b.moveToObject('#note0', 60, 60);
//       b.buttonUp(0);
//
//       const newPos = b.getLocation('#note0');
//       expect(newPos.x - oldPos.x).to.equal(50);
//       expect(newPos.y - oldPos.y).to.equal(50);
//       expectHighlighted('#note0');
//     });
//
//     it('dragging on an unhighlighted note does not perform drag', () => {
//       b.click('#note0');
//       const oldPos = b.getLocation('#note0');
//
//       b.moveToObject('#note1', 10, 10);
//       b.buttonDown(0);
//       b.moveToObject('#note1', 40, 40);
//       b.buttonUp(0);
//
//       const newPos = b.getLocation('#note0');
//       expect(newPos.x).to.equal(oldPos.x);
//       expect(newPos.y).to.equal(oldPos.y);
//     });
//
//     it('can drag more than one note', () => {
//       b.click('#note0');
//       b.click('#note1');
//       b.click('#note1');
//
//       const oldPos0 = b.getLocation('#note0');
//       const oldPos1 = b.getLocation('#note1');
//
//       b.moveToObject('#note0', 10, 10);
//       b.buttonDown(0);
//       b.moveToObject('#note0', 40, 40);
//       b.buttonUp(0);
//
//       const newPos0 = b.getLocation('#note0');
//       const newPos1 = b.getLocation('#note1');
//
//       expect(newPos0.x - oldPos0.x).to.equal(30);
//       expect(newPos0.y - oldPos0.y).to.equal(30);
//       expectHighlighted('#note0');
//       expect(newPos1.x - oldPos1.x).to.equal(30);
//       expect(newPos1.y - oldPos1.y).to.equal(30);
//       expectHighlighted('#note1');
//     });
//
//     it('note positions are reliable after drag', () => {
//       expect(b.getAttribute('#note0', 'data-x')).to.equal('0');
//       expect(b.getAttribute('#note0', 'data-y')).to.equal('0');
//       expect(b.getAttribute('#note1', 'data-x')).to.equal('0');
//       expect(b.getAttribute('#note1', 'data-y')).to.equal('0');
//     });
//
//     it('dragging after standard is stable', () => {
//       switchMode('#ic-standard');
//       const oldPos = b.getLocation('#note0');
//
//       b.moveToObject('#note0', 10, 10);
//       b.buttonDown(0);
//       b.moveToObject('#note0', 50, 50);
//       b.buttonUp(0);
//
//       const newPos = b.getLocation('#note0');
//       expect(newPos.x - oldPos.x).to.equal(40);
//       expect(newPos.y - oldPos.y).to.equal(40);
//     });
//   });
//
//   describe('drag select', () => {
//     it('shows selecting area', () => {
//       expect('#select-area').to.not.be.visible();
//       b.moveToObject('body', 100, 100);
//       b.buttonDown(0);
//       b.moveToObject('body', 600, 600);
//       expect('#select-area').to.be.visible();
//       expect(b.getCssProperty('#select-area', 'width').value).to.equal('500px');
//       expect(b.getCssProperty('#select-area', 'height').value).to.equal('500px');
//       b.buttonUp(0);
//     });
//
//     it('select notes that intersect with the area', () => {
//       expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(40,138,255)');
//       expect(b.getCssProperty('#note1', 'border-color').value).to.equal('rgb(40,138,255)');
//       expect(b.getCssProperty('#note2', 'border-color').value).to.equal('rgb(40,138,255)');
//       expect(b.getCssProperty('#note3', 'border-color').value).to.equal('rgb(40,138,255)');
//       expect('#ic-visual-toolbar').to.be.visible();
//     });
//
//     it('can click off to exit bulk edit mode', () => {
//       b.click('div#experiments');
//       expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(0,0,0)');
//       expect(b.getCssProperty('#note1', 'border-color').value).to.equal('rgb(0,0,0)');
//       expect(b.getCssProperty('#note2', 'border-color').value).to.equal('rgb(0,0,0)');
//       expect(b.getCssProperty('#note3', 'border-color').value).to.equal('rgb(0,0,0)');
//       expect('#ic-visual-toolbar').to.not.be.visible();
//     });
//   });
//
//   it('bulk delete', () => {
//     switchMode('#ic-bulk');
//     b.click('#note0');
//     b.click('#note1');
//     b.click('#note2');
//     b.click('#note3');
//     b.click('button#ic-bulk-delete');
//     b.waitForDisplayed('#ic-modal');
//     expect('#ic-modal-body').to.have.text(/Are you sure/);
//     b.click('#ic-modal-confirm');
//     b.pause(1000);
//
//     expect('#ic-visual-toolbar').to.not.be.there();
//     expect('#note0').to.not.be.there();
//     expect('#note1').to.not.be.there();
//     expect('#note2').to.not.be.there();
//     expect('#note3').to.not.be.there();
//   });
// });
