const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const { cleanup } = require('./utils');
const expect = chai.expect;
const b = browser;

describe('landing page', () => {
  afterAll(cleanup);

  it('renders correctly', () => {
    b.setViewportSize({ width: 2000, height: 2000 });
    b.url('http://localhost:8080');
    b.waitForDisplayed('body');
    expect(b.getTitle()).to.equal('The Innovators\' Compass');
    expect('div#message').to.be.visible();
    expect('div#get-started-form').to.be.visible();
    expect('div#get-started-form input').to.have.count(2);
    expect('a.ic-guide').to.be.visible();
  });

  it('has link to guide', () => {
    expect(b.getAttribute('a.ic-guide', 'href')).to.equal('https://youtu.be/3IbxFHQ5Dxo');
  });

  it('make flow shows correct prompts', () => {
    const prompts = b.elements('div#get-started-form p').value;
    expect(prompts[0].getText()).to.equal('What topic are you working on?');
    expect(prompts[1].getText()).to.equal('Your name');
  });

  describe('invalid input', () => {
    afterEach(() => {
      b.clearElement('#compass-center');
      b.clearElement('#username');
    });

    it('missing both', () => {
      b.click('button[type=submit]').pause(200);
      // TODO instead of checking we are not on the next page, check for the error alerts
      expect('#ic-modal').to.not.be.visible();
      expect('#compass').to.not.be.visible();
    });

    it('missing username', () => {
      b.setValue('#compass-center', 'acceptable');
      b.click('button[type=submit]').pause(200);
      expect('#ic-modal').to.not.be.visible();
      expect('#compass').to.not.be.visible();
    });

    it('missing topic', () => {
      b.setValue('#username', 'sandbox');
      b.click('button[type=submit]').pause(200);
      expect('#ic-modal').to.not.be.visible();
      expect('#compass').to.not.be.visible();
    });
  });

  describe('valid input', () => {
    it('can create compass and is prompted for email', () => {
      b.setValue('#compass-center', 'topic');
      b.setValue('#username', 'sandbox');
      b.click('button[type=submit]');
      b.waitForDisplayed('#ic-modal');

      expect('#ic-modal-body').to.have.text(/Receive a Link/);
      expect('#ic-modal-confirm').to.be.visible();
      expect('#ic-modal-cancel').to.be.visible();
      expect('#ic-modal-input').to.be.visible();
    });

    it('can skip providing email', () => {
      b.click('#ic-modal-cancel');
      b.waitForDisplayed('#compass');
    });

    it('empty email skips sending reminder', () => {
      b.clearElement('#ic-modal-input');
    });

    it('valid email shows toast', () => {
      b.back();
      b.waitForDisplayed('#ic-landing-container');
      b.setValue('#compass-center', 'topic');
      b.setValue('#username', 'valid');
      b.click('button[type=submit]');
      b.waitForDisplayed('#ic-modal');
      b.setValue('#ic-modal-input', 'fakeemail@test.com');
      b.click('#ic-modal-confirm');
      b.waitForDisplayed('#ic-toast span');
      expect('#ic-toast span').to.have.text(/link to this workspace/);
    });
  });

  describe('email', () => {
    beforeEach(() => {
      // Fills out the fields, and clicks the submit button so that each test
      // starts with the email prompt showing.
      b.url('http://localhost:8080/');
      b.setValue('#compass-center', 'center');
      b.setValue('#username', 'sandbox');
      b.click('button[type=submit]');
      b.waitForDisplayed('#ic-modal-body');
    });

    describe('email validation', () => {
      it('rejects empty email', () => {
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#ic-toast');
        expect('#ic-toast').to.have.text(/not a valid email address/);
      });

      it('rejects invalid email', () => {
        b.setValue('#ic-modal-input', 'fakeemail');
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#ic-toast');
        expect('#ic-toast').to.have.text(/not a valid email address/);
      });

      it('valid email goes through', () => {
        b.setValue('#ic-modal-input', 'tester@test.com');
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#compass');
      });

      it('skipping goes through', () => {
        b.click('#ic-modal-cancel');
        b.waitForDisplayed('#compass');
      });

      it('skipping goes through even with invalid input', () => {
        b.setValue('#ic-modal-input', 'fakeemail');
        b.click('#ic-modal-cancel');
        b.waitForDisplayed('#compass');
      });
    });

    describe('always email feature', () => {
      it('does not store an invalid email', () => {
        b.waitForDisplayed('#ic-always-email-value');

        b.setValue('#ic-modal-input', 'invalidemail');
        b.click('#ic-always-email-value');
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#ic-toast');
        expect('#ic-toast').to.have.text(/not a valid email address/);

        // to test that it's not stored, refresh the page and
        // re-execute the form
        b.url('http://localhost:8080/');
        b.setValue('#compass-center', 'center');
        b.setValue('#username', 'sandbox');
        b.click('button[type=submit]');
        // assert that the modal is shown again
        b.waitForDisplayed('#ic-always-email-value');
        expect(b.isSelected('#ic-always-email-value')).to.be.false;
      });

      it('does store valid email', () => {
        b.waitForDisplayed('#ic-always-email-value');

        b.setValue('#ic-modal-input', 'fakeuser@fakedomain.com');
        b.click('#ic-always-email-value');
        b.click('#ic-modal-confirm');
        b.waitForDisplayed('#ic-toast');
        expect('#ic-toast').to.have.text(/link to this workspace/);

        // to test that it's stored, refresh the page and
        // re-execute the form
        b.url('http://localhost:8080/');
        b.setValue('#compass-center', 'center');
        b.setValue('#username', 'sandbox');
        b.click('button[type=submit]');
        // assert that we are taken straight to workspace
        b.waitForDisplayed('#ic-toast');
        expect('#ic-toast').to.have.text(/automatically/);
      });

      it('unsubscription', () => {
        b.url('http://localhost:8080/disable-auto-email');
        b.waitForDisplayed('#ic-modal');
        expect('#ic-modal-body').to.have.text(/turned off/);
        // redirects to home page
        b.click('#ic-modal-confirm');

        b.waitForDisplayed('#ic-landing-container');
        b.setValue('#compass-center', 'center');
        b.setValue('#username', 'sandbox');
        b.click('button[type=submit]');
        // assert shown and unchecked
        b.waitForDisplayed('#ic-always-email-value');
        expect(b.isSelected('#ic-always-email-value')).to.be.false;
      });
    });
  });
});
