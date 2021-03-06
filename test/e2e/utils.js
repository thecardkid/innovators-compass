const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const _ = require('underscore');

const { expect } = chai;
const { STICKY_COLORS } = require('../../lib/constants');

const setup = () => {
  browser.setViewportSize({ width: 2000, height: 2000 });
  browser.url('http://localhost:8080');
  browser.waitForVisible('body', 1000);
  // TODO compass-center is legacy (from before "topic" existed).
  // Rename to compass-topic
  browser.setValue('#compass-center', 'webdriverio');
  browser.setValue('#username', 'sandbox');
  browser.click('button[type=submit]');
  browser.waitForVisible('#ic-modal', 1000);
  // do not email
  browser.click('#ic-modal-cancel');
  browser.waitForVisible('#compass', 1000);
  // set center
  browser.waitForVisible('#ic-modal');
  // this is confusing. The input is setting the center of the
  // compass, not the topic
  browser.setValue('#ic-modal-input', 'topic');
  browser.click('#ic-modal-confirm');
  // wait for animation
  browser.pause(2000);
};

const cleanup = () => {
  selectMenuOption(menuActions.deleteWorkspace);
  browser.pause(5000);
  // confirm delete
  browser.waitForVisible('#ic-modal', 100);
  browser.click('#ic-modal-confirm');
  // confirm thank-you-note
  browser.waitForVisible('#ic-modal', 5000);
  browser.click('#ic-modal-confirm');
};

// TODO deprecate switchMode and replace with selectSubmenuOption
const switchMode = (modeId) => {
  browser.click('button.ic-workspace-button');
  browser.waitForVisible('div.ic-workspace-menu');
  browser.moveTo(browser.elements('div.has-more').value[3].ELEMENT, 10, 10);
  browser.waitForVisible('div.ic-modes-submenu');
  browser.click(modeId);
};

const expectCompassStructure = () => {
  expect('#observations').to.be.visible();
  expect('#observations h1').to.have.text(/OBSERVATIONS/);
  expect('#observations h2').to.have.text(/What's happening\? Why\?/);

  expect('#principles').to.be.visible();
  expect('#principles h1').to.have.text(/PRINCIPLES/);
  expect('#principles h2').to.have.text(/What matters most\?/);

  expect('#ideas').to.be.visible();
  expect('#ideas h1').to.have.text(/IDEAS/);
  expect('#ideas h2').to.have.text(/What ways are there\?/);

  expect('#experiments').to.be.visible();
  expect('#experiments h1').to.have.text(/EXPERIMENTS/);
  expect('#experiments h2').to.have.text(/What's a step to try\?/);
};

const selectColor = (color) => {
  browser.click('.ic-form-palette .icon');
  browser.elements('.ic-color').value[_.indexOf(STICKY_COLORS, color)].click();
};

const exportsSubmenu = { submenu: 'div.ic-exports-submenu', submenuPosition: 0 };
const moveCenterSubmenu = { submenu: 'div.ic-resize-submenu', submenuPosition: 1 };
const notesSubmenu = { submenu: 'div.ic-notes-submenu', submenuPosition: 2 };
const modesSubmenu = { submenu: 'div.ic-modes-submenu', submenuPosition: 3 };
const menuActions = {
  newWorkspace: 0,
  darkTheme: 1,
  email: 2,
  bookmark: 3,
  share: 4,
  logout: 10,
  deleteWorkspace: 11,

  googleDocs: { ...exportsSubmenu, position: 0 },
  screenshot: { ...exportsSubmenu, position: 1 },

  customCenterPosition: {...moveCenterSubmenu, position: 0},
  resetCenterPosition: {...moveCenterSubmenu, position: 1},

  textNote: { ...notesSubmenu, position: 0 },
  imageNote: { ...notesSubmenu, position: 1 },
  doodleNote: { ...notesSubmenu, position: 2 },

  standardMode: { ...modesSubmenu, position: 0 },
  compactMode: { ...modesSubmenu, position: 1 },
  bulkMode: { ...modesSubmenu, position: 2 },
  explainModes: { ...modesSubmenu, position: 3 },
};

const selectMenuOption = (count) => {
  browser.click('button.ic-workspace-button');
  browser.waitForVisible('div.ic-workspace-menu');
  browser.elements('div.ic-menu-item').value[count].click();
};

const selectSubmenuOption = ({ submenu, submenuPosition, position }) => {
  browser.click('button.ic-workspace-button');
  browser.waitForVisible('div.ic-workspace-menu');
  browser.moveTo(browser.elements('div.has-more').value[submenuPosition].ELEMENT, 10, 10);
  browser.waitForVisible(submenu);
  browser.elements(`${submenu} div.ic-menu-item`).value[position].click();
};

module.exports = {
  setup,
  cleanup,
  switchMode,
  expectCompassStructure,
  selectColor,
  menuActions,
  selectMenuOption,
  selectSubmenuOption,
};
