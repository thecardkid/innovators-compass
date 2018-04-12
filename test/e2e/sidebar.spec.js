const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

const PROMPTS = require('../../lib/constants').PROMPTS;
const MODALS = require('../../lib/constants').MODALS;

describe('sidebar', () => {
  beforeAll(() => {
    require('./utils').setup();
  });

  afterAll(() => {
    b.back();
    b.waitForVisible('#ic-sidebar');
    require('./utils').cleanup();
  });

  describe('share section', () => {
    it('share edit mode', () => {
      expect('div.ic-sidebar-list[name="share"]').to.be.visible();
      b.click('button[name="share-edit"]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Share this link below/);
      expect('#ic-modal-body p').to.have.text(/\/compass\/edit/);
      b.click('#ic-modal-confirm');
    });

    it('share view mode', () => {
      b.click('button[name="share-view"]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Share this link below/);
      expect('#ic-modal-body p').to.have.text(/\/compass\/view/);
      b.click('#ic-modal-confirm');
    });

    describe('email reminder', () => {
      it('wrong email format displays error message', () => {
        b.click('button[name=email]');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Enter your email/);
        b.setValue('#ic-modal-input', 'fakeemail');
        b.click('#ic-modal-confirm');
        b.pause(200);
        expect('#ic-modal-body').to.have.text(/does not look right/);
      });

      it('valid email shows toast', () => {
        b.setValue('#ic-modal-input', 'fakeemail@valid.com');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast span');
        expect('#ic-toast span').to.have.text(/email/);
      });
    });

    it('export button', () => {
      b.click('button[name="export"]');
      b.waitForVisible('#ic-modal');
      expect(b.getText('#ic-modal-body')).to.contain('I see you want to save this compass as a PDF');
      b.click('#ic-modal-cancel');
    });

    it('tweet button is there', () => {
      expect('button[name=tweet]').to.be.visible();
    });
  });

  describe('controls section', () => {
    let buttons;

    beforeAll(() => {
      buttons = b.elements('div.ic-sidebar-list[name=controls] .ic-action').value;
    });

    it('is visible', () => {
      expect('div.ic-sidebar-list[name=controls]').to.be.visible();
    });

    it('new note button', () => {
      buttons[0].click();
      expect('#ic-note-form').to.be.visible();
      b.click('button[name="nvm"]');
    });

    it('new doodle button', () => {
      buttons[1].click();
      expect('#ic-doodle-form').to.be.visible();
      b.click('button[name="nvm"]');
    });

    it('toggle sidebar button', () => {
      buttons[2].click();
      b.pause(500);
      expect(b.getCssProperty('#ic-sidebar', 'left').value).to.equal('-240px');
      b.click('#ic-show-sidebar');
      b.pause(500);
    });

    it('toggle chat button', () => {
      buttons[3].click();
      b.pause(500);
      expect(b.getCssProperty('#ic-chat', 'bottom').value).to.equal('0px');
      buttons[3].click();
      b.pause(500);
      expect(b.getCssProperty('#ic-chat', 'bottom').value).to.equal('-270px');
    });

    it('toggle prompt button', () => {
      buttons[4].click();
      expect('#ic-about').to.be.visible();
      b.click('#ic-about button.ic-close-window');
    });
  });

  it('user section', () => {
    expect('div.ic-sidebar-list[name=users]').to.be.visible();
    expect('div.ic-sidebar-list[name=users] p').to.have.text(/You/);
  });

  it('status section', () => {
    expect('div.ic-sidebar-list[name=status]').to.be.visible();
    expect('div.ic-sidebar-list[name=status] h2').to.have.text(/Status - connected/);
  });

  it('credits section', () => {
    expect('div.ic-sidebar-list[name=credits]').to.be.visible();
    expect(b.getAttribute('div.ic-sidebar-list[name=credits] p[name=ela] a', 'href')).to.equal('http://innovatorscompass.org/');
    expect(b.getAttribute('div.ic-sidebar-list[name=credits] p[name=hieu] a', 'href')).to.equal('http://hieuqn.com/');
  });

  it('version section', () => {
    expect('div.ic-sidebar-list[name=version]').to.be.visible();
    expect(b.getAttribute('div.ic-sidebar-list[name=version] p a', 'href')).to.equal('https://github.com/thecardkid/innovators-compass/releases');
  });

  describe('timer section', () => {
    it('timer form has all components', () => {
      expect('button[name=timer]').to.be.visible();
      b.click('button[name=timer]');
      b.waitForVisible('#ic-timer-form');

      expect('button[name=ic-30s]').to.be.visible();
      expect('button[name=ic-1m]').to.be.visible();
      expect('button[name=ic-3m]').to.be.visible();
    });

    it('display toast and start countdown with correct time when 3m timer is created', () => {
      b.click('button[name=ic-3m]');
      b.waitForVisible('#ic-toast span');
      expect(b.getAttribute('#ic-toast span', 'class')).to.equal('info');
      expect('#ic-toast span').to.have.text(PROMPTS.TIMEBOX(3, 0));
      expect('button[name=timer] div p').to.have.text('03:00');
      expect('div.ic-timer-action p').to.have.text('stop');
    });

    it('clicking "stop" stops timer', () => {
      b.click('div.ic-timer-action.dangerous');
      expect('button[name=timer]').to.have.text(/timebox/);
      b.click('button[name=timer]');
      b.waitForVisible('#ic-timer-form');
    });

    describe('invalid input', () => {
      it('negative time not allowed', () => {
        b.clearElement('input#ic-timer-min');
        b.setValue('input#ic-timer-min', -2);
        b.click('button[name=ship]');
        b.waitForVisible('#ic-toast span');
        expect(b.getAttribute('#ic-toast span', 'class')).to.equal('error');
        expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.TIMEBOX_NEGATIVE_VALUES, 'i'));
      });

      it('limited to 30 minutes', () => {
        b.clearElement('input#ic-timer-min');
        b.setValue('input#ic-timer-min', 31);
        b.click('button[name=ship]');
        b.waitForVisible('#ic-toast span');
        expect(b.getAttribute('#ic-toast span', 'class')).to.equal('error');
        expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.TIMEBOX_TOO_LONG, 'i'));
      });

      it('limited to 60 seconds', () => {
        b.clearElement('input#ic-timer-min');
        b.setValue('input#ic-timer-min', 0);
        b.clearElement('input#ic-timer-sec');
        b.setValue('input#ic-timer-sec', 61);
        b.click('button[name=ship]');
        b.waitForVisible('#ic-toast span');
        expect(b.getAttribute('#ic-toast span', 'class')).to.equal('error');
        expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.TIMEBOX_TOO_MANY_SECONDS, 'i'));
      });
    });

    it('display toast when timebox is over', () => {
      b.clearElement('input#ic-timer-sec');
      b.setValue('input#ic-timer-sec', 2);
      b.click('button[name=ship]');
      b.waitForVisible('#ic-toast span');
      expect(b.getAttribute('#ic-toast span', 'class')).to.equal('info');
      expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.TIMEBOX(0, 2), 'i'));
      b.pause(3000);
      expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.TIMEBOX_OVER, 'i'));
    });
  });

  describe('other actions section', () => {
    it('privacy statement', () => {
      expect('button[name=privacy]').to.be.visible();
      b.click('button[name=privacy]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/Privacy Statement/);
      b.click('#ic-modal-confirm');
    });

    it('feedback form', () => {
      expect('button[name=sucks]').to.be.visible();
      b.click('button[name=sucks]');
      b.waitForVisible('#ic-modal');
      expect('#ic-modal-body').to.have.text(/We'd love to hear from you/);
      b.click('#ic-modal-confirm');
    });

    it('tutorial button has link', () => {
      expect('button[name=tutorial] a').to.be.there();
    });

    describe('bookmarking', () => {
      it('toast displays success status', () => {
        b.click('button[name=save]');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(/Bookmarks give you quick access/);
        b.setValue('#ic-modal-input', 'My bookmark');
        b.click('#ic-modal-confirm');
        b.waitForVisible('#ic-toast span');
        expect(b.getAttribute('#ic-toast span', 'class')).to.equal('success');
        expect('#ic-toast span').to.have.text(new RegExp(PROMPTS.SAVE_SUCCESS, 'i'));
        b.click('#ic-toast span');
      });

      it('bookmark has correct info', () => {
        b.click('button[name=logout]');
        b.waitForVisible('div.ic-saved');
        expect(b.getUrl()).to.equal('http://localhost:8080/');
        b.click('div.ic-saved a');
        b.waitForVisible('#compass');
        expect(b.getUrl()).to.contain('http://localhost:8080/compass/edit');
        b.back();
        b.waitForVisible('#ic-landing');
        b.click('div.ic-saved #arrow');
        b.pause(100);
        expect('div.ic-saved a').to.have.text('My bookmark');
        expect('div.ic-saved div.ic-saved-info p').to.have.text('as "sandbox"');
      });

      it('can edit bookmark', () => {
        b.click('button.edit');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.contain.text(new RegExp(MODALS.EDIT_BOOKMARK, 'i'));
        b.setValue('#ic-modal-input', 'Changed name');
        b.click('#ic-modal-confirm');
        expect('div.ic-saved a').to.have.text('Changed name');
      });

      it('can remove bookmark', () => {
        b.click('button.remove');
        b.waitForVisible('#ic-modal');
        expect('#ic-modal-body').to.have.text(new RegExp(MODALS.DELETE_BOOKMARK.text, 'i'));
        b.click('#ic-modal-confirm');
        expect('div.ic-saved').to.not.be.there();
      });
    });
  });
});
