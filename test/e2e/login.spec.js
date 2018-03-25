const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const ERROR_MSG = require('../../lib/constants.js').ERROR_MSG;

const expectErrorMessage = require('./utils').expectErrorMessage;

describe('login', () => {
  let code;

  afterAll(() => {
    b.click('button[name=to-workspace]');
    b.waitForVisible('#ic-sidebar');
    require('./utils').cleanup();
  });

  it('loads correctly', () => {
    b.setViewportSize({ width: 2000, height: 2000 });
    b.url('http://localhost:8080');
    b.waitForVisible('body');
    expect(b.getTitle()).to.equal('The Innovators\' Compass');
    expect('button[name="find"]').to.be.visible();
    expect('button[name="make"]').to.be.visible();
  });

  it('make flow shows correct prompts', () => {
    b.click('button[name="make"]');
    b.waitForVisible('input#compass-center');

    const namePrompt = b.getAttribute('input#username', 'placeholder');
    expect(namePrompt).to.equal('Your name (as you\'d like it to appear, no spaces)');

    const topicPrompt = b.getAttribute('input#compass-center', 'placeholder');
    expect(topicPrompt).to.equal('Topic: Who\'s involved?');
  });

  it('make flow shows correct errors', () => {
    b.click('button[name="next"]');
    expectErrorMessage(ERROR_MSG.REQUIRED('Topic'));

    b.setValue('#compass-center', 'acceptable');
    b.click('button[name="next"]');
    expectErrorMessage(ERROR_MSG.REQUIRED('Username'));

    b.setValue('#compass-center', 'This is a really long topic name that will hopefully exceed char limit');
    b.click('button[name="next"]');
    expectErrorMessage(ERROR_MSG.TEXT_TOO_LONG('Topic', 30));

    b.clearElement('#compass-center');
    b.setValue('#username', 'sandbox');
    b.click('button[name="next"]');
    expectErrorMessage(ERROR_MSG.REQUIRED('Topic'));
  });

  it('make flow successful', () => {
    b.clearElement('#compass-center');
    b.setValue('#compass-center', 'webdriverio');
    b.click('button[name="next"]');
    b.waitForVisible('#ic-modal');

    expect('#ic-modal-body').to.have.text(/Your workspace is ready/);

    b.click('#ic-modal-confirm');
    code = b.getUrl().split('/')[5];
  });

  it('find flow shows correct prompts', () => {
    b.url('http://localhost:8080');
    b.click('button[name="find"]');
    b.waitForVisible('input#compass-code');

    const codePrompt = b.getAttribute('input#compass-code', 'placeholder');
    expect(codePrompt).to.equal('The code of the compass you\'re looking for');

    const namePrompt = b.getAttribute('input#username', 'placeholder');
    expect(namePrompt).to.equal('Your name (as you\'d like it to appear, no spaces)');
  });

  it('find flow shows correct errors', () => {
    b.click('button[name="next"]');
    expectErrorMessage(ERROR_MSG.REQUIRED('A code'));

    b.setValue('#compass-code', '1234567');
    b.click('button[name="next"]');
    expectErrorMessage(ERROR_MSG.INVALID('Your code'));

    b.addValue('#compass-code', '8');
    b.click('button[name="next"]');
    expectErrorMessage(ERROR_MSG.REQUIRED('Username'));

    b.setValue('#username', 'sandbox5');
    b.click('button[name="next"]');
    expectErrorMessage(ERROR_MSG.UNAME_HAS_NON_CHAR);

    b.setValue('#username', ',,,###');
    b.click('button[name="next"]');
    expectErrorMessage(ERROR_MSG.UNAME_HAS_NON_CHAR);

    b.setValue('#username', 'sandboxsandboxsandboxsandboxsandboxsandbox');
    b.click('button[name="next"]');
    expectErrorMessage(ERROR_MSG.TEXT_TOO_LONG('Username', 15));

    b.setValue('#username', 'validusername');
  });

  it('find flow successful', () => {
    b.setValue('#compass-code', code);
    b.setValue('#username', 'sandbox');
    b.click('button[name="next"]');
    b.waitForVisible('#ic-modal');
    expect('#ic-modal-body').to.have.text(/You will be logged in as "sandbox" with edit access/);
  });
});
