const { getColorAttr, workspaceMenu } = require('./data_cy');

function waitForVisible(selector) {
  cy.get(selector, { timeout: 10000 }).should('be.visible');
}

function setup() {
  cy.visit('http://localhost:8080');
  // TODO compass-center is legacy (from before "topic" existed).
  // Rename to compass-topic
  cy.get('#compass-center').type('webdriverio');
  cy.get('#username').type('sandbox');
  cy.get('button[type=submit]').click();
  // do not email
  cy.get('#ic-modal-cancel').click();
  waitForVisible('#compass', 1000);
  // set center
  waitForVisible('#ic-modal');
  // this is confusing. The input is setting the center of the
  // compass, not the topic
  cy.get('#ic-modal-input').type('topic');
  cy.get('#ic-modal-confirm').click();
  // wait for animation
  cy.wait(2000);
}

function selectMenuOption(attr) {
  cy.get('button.ic-workspace-button').click();
  waitForVisible('div.ic-workspace-menu');
  getElemWithDataCy(attr).click();
}

function cleanup() {
  selectMenuOption(workspaceMenu.deleteWorkspace);
  // confirm delete
  waitForVisible('#ic-modal', 100);
  cy.get('#ic-modal-confirm').click();
  // confirm thank-you-note
  waitForVisible('#ic-modal', 5000);
  cy.get('#ic-modal-confirm').click();
}

function expectCompassStructure() {
  cy.get('#observations').should('be.visible');
  cy.get('#observations h1').should('contain', 'OBSERVATIONS');
  cy.get('#observations h2').should('contain', 'What\'s happening? Why?');

  cy.get('#principles').should('be.visible');
  cy.get('#principles h1').should('contain', 'PRINCIPLES');
  cy.get('#principles h2').should('contain', 'What matters most?');

  cy.get('#ideas').should('be.visible');
  cy.get('#ideas h1').should('contain', 'IDEAS');
  cy.get('#ideas h2').should('contain', 'What ways are there?');

  cy.get('#experiments').should('be.visible');
  cy.get('#experiments h1').should('contain', 'EXPERIMENTS');
  cy.get('#experiments h2').should('contain', 'What\'s a step to try?');
}

function selectColor(color) {
  cy.get('.ic-form-palette .icon').click();
  getElemWithDataCy(getColorAttr(color)).click();
}

function selectSubmenuOption({ submenu, suboption }) {
  cy.get('button.ic-workspace-button').click();
  getElemWithDataCy(submenu).trigger('mouseover');
  getElemWithDataCy(suboption).click();
}

function getElemWithDataCy(attr) {
  return cy.get(`[data-cy=${attr}]`);
}

module.exports = {
  setup,
  cleanup,
  expectCompassStructure,
  selectColor,
  selectMenuOption,
  selectSubmenuOption,
  waitForVisible,
  getElemWithDataCy,
};
