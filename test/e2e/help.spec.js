const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const { setup, cleanup } = require('./utils');

const actions = {
  prompt: 0,
  guide: 1,
  about: 2,
  privacy: 3,
  release: 4,
  contact: 5,
};

const selectHelpOption = (count) => {
  b.click('button.ic-help-button');
  b.waitForDisplayed('div.ic-help-menu');
  b.elements('div.ic-menu-item').value[count].click();
};

describe('help menu', () => {
  beforeAll(() => {
    setup();
    this.tabId = b.getTabIds()[0];
  });

  afterAll(cleanup);

  it('prompt', () => {
    selectHelpOption(actions.prompt);
    b.waitForDisplayed('#ic-modal');
    expect('#ic-modal-body').to.have.text(/Innovator's Compass/);
    b.click('#ic-modal-confirm');
  });

  it('quick start guide', () => {
    selectHelpOption(actions.guide);
    b.pause(200);
    expect(b.getTabIds()).to.have.length(2);
    b.switchTab(this.tabId);
  });

  it('about us', () => {
    selectHelpOption(actions.about);
    b.waitForDisplayed('#ic-modal');
    expect('#ic-modal-body').to.have.text(/Hi!/);
    b.click('#ic-modal-confirm');
  });

  it('release notes', () => {
    selectHelpOption(actions.release);
    b.waitForDisplayed('#ic-modal');
    expect('#ic-modal-body').to.have.text(/Release/);
    b.click('#ic-modal-confirm');
  });

  it('privacy statement', () => {
    selectHelpOption(actions.privacy);
    b.waitForDisplayed('#ic-modal');
    expect('#ic-modal-body').to.have.text(/Privacy Statement/);
    b.click('#ic-modal-confirm');
  });

  it('contact', () => {
    selectHelpOption(actions.contact);
    b.waitForDisplayed('.ic-dynamic-modal');
    expect('.ic-dynamic-modal .contents').to.have.text(/I'd love to hear from you/);
    b.click('button.ic-close-window');
  });
});