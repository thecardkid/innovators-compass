import $ from 'jquery';
import ReactGA from 'react-ga';
import { browserHistory } from 'react-router';
import _ from 'underscore';

import { TWEET } from '../../backend/lib/constants';

const ModalSingleton = (() => {
  class Modal {
    constructor() {
      this.show = false;
    }

    addBackdropIfNecessary() {
      if ($('#ic-backdrop').length === 0) {
        $('#ic-modal-container').append('<div id="ic-backdrop"></div>');
      }
    }

    image({ src, background }) {
      let style = '';
      if (background) {
        style += `style="background:${background}"`;
      }

      const html = `
        <div id="ic-modal-image" ${style}>
          <img src="${src}" />
        </div>
      `;

      this.renderModal(html);
      this.onEvent({});
    }

    getModalHtml(body, confirm, cancel = '') {
      return (`
        <div id="ic-modal">
          <div id="ic-modal-body">${body}</div>
          <div id="ic-modal-footer">
            ${confirm}
            ${cancel}
          </div>
        </div>
      `);
    }

    renderModal(html) {
      const $container = $('#ic-modal-container');
      $container.empty().append(html);
      let $backdrop = $('#ic-backdrop');
      if ($backdrop.length === 0) {
        $container.append('<div id="ic-backdrop"></div>');
      }
    }

    onEvent({
      onConfirm = _.noop,
      onCancel =_.noop,
      onBackdrop = _.noop,
    }) {
      this.show = true;

      $('#ic-modal-confirm').on('click', () => {
        this.close();
        onConfirm();
      });
      $('#ic-modal-cancel').on('click', () => {
        this.close();
        onCancel();
      });
      $('#ic-backdrop').on('click', () => {
        this.close();
        onBackdrop();
      });
    }

    confirm({
      heading = 'Are you sure?',
      body = '',
      confirmText = 'OK',
      cancelText = 'Cancel',
      isDangerous = true,
      cb = _.noop,
    }) {
      let bodyHtml = `<h3>${heading}</h3>`;

      if (typeof body === 'string') {
        bodyHtml += `<p>${body}</p>`;
      } else if (body.length > 0) {
        _.each(body, p => bodyHtml += `<p>${p}</p>`);
      }

      const html = this.getModalHtml(
        bodyHtml,
        `<button id="ic-modal-confirm" class="${isDangerous ? 'danger': 'confirm'}">${confirmText}</button>`,
        `<button id="ic-modal-cancel">${cancelText}</button>`,
      );

      this.renderModal(html);

      this.onEvent({
        onConfirm: () => cb(true),
        onCancel: () => cb(false),
        onBackdrop: () => cb(false),
      });
    }

    generateAlert(text) {
      return this.getModalHtml(
        text,
        '<button id="ic-modal-confirm">Got it</button>',
      );
    }

    alert({
      heading = '',
      body = '',
      cb = _.noop,
    }) {
      let html = `<h3>${heading}</h3>`;

      if (typeof body === 'string') {
        html += `<p>${body}</p>`;
      } else if (body.length > 0) {
        _.each(body, p => html += `<p>${p}</p>`);
      }

      this.renderModal(this.generateAlert(html));
      this.onEvent({
        onConfirm: cb,
        onCancel: _.noop,
        onBackdrop: cb,
      });
    }

    alertPrivacyStatement = () => {
      ReactGA.modalview('modals/privacy-statement');
      this.alert({
        heading: 'Privacy Statement',
        body: [
          'iCompass will not share your Compass, code, data, or any personal information included in your compass with any third party.',
          'Anyone who has your workspace\'s edit code with will be able to modify, add, or delete any and all data in your Compass. Save and share your Compass link with care, and ask any collaborator to do the same.'
        ],
      });
    };

    alertFeedback = (code) => {
      ReactGA.modalview('modals/feedback');
      this.alert({
        heading: 'We\'d love to hear from you!',
        body: [
          `It's a huge help to us if you reach out with your experiences and questions! Please email
          <a href="mailto:hieumaster95@gmail.com"><u>Hieu</u></a> (app creator) or 
          <a href="mailto:ela@innovatorscompass.org"><u>Ela</u></a> (Compass creator).
          Or <a href="${TWEET + code}"><u>tweet</u></a>!`,
          `To report a bug or request a feature, please go
          <a href="https://github.com/thecardkid/innovators-compass/issues" target="_blank" rel="noopener noreferrer"><u>here</u></a>
          and click New issue.`,
          `If you are reporting a bug, please list the steps to reproduce or include screenshots.
          If requesting a new feature, please be specific!`,
        ],
      });
    };

    alertCompassPrompt = () => {
      ReactGA.modalview('modals/prompt');
      this.alert({
        heading: 'The Innovator\'s Compass',
        body: [
          'Starting something or feeling stuck? Use five questions, asked by all kinds of innovators, to make things better.',
          'Explore anything you\'re doing, alone or with others. You\'ll see challenges in new ways.',
          '<b>1. PEOPLE: Who could be involved?</b> ...including you? For and with everyone involved, explore...',
          '<b>2. OBSERVATIONS: What\'s happening? Why?</b> What are people doing? Saying? Thinking? Feeling? Why? See all sides, ups and downs.',
          '<b>3. PRINCIPLES: What matters most</b> for everyone involved? Principles often compete - inspiring us to get creative!',
          '<b>4. IDEAS: What ways are there?</b> Anyone and anything can help. Look around for ideas! Play with who/what/when/where/how.',
          '<b>5. EXPERIMENTS: What\'s a step to try?</b> With little time/risk/cost? Do it! What happens for all involved (#1 & 2)?',
          'Really explore. Look, listen, feel; use words, draw, move, make. In this order (P.O.P.I.E.) or any way that moves you forward.',
          'For more information, visit <a href="http://innovatorscompass.org" target="_blank"><u>innovatorscompass.org</u></a>.',
        ],
      });
    };

    alertExplainModes = () => {
      ReactGA.modalview('modals/explain-modes');
      this.alert({
        heading: 'What are these modes?',
        body: [
          '<b>Standard mode</b> is what you are in by default',
          '<b>Compact mode</b> make notes take up much less space - it is meant for smaller devices.',
          '<b>Bulk Edit</b> mode allows you to edit notes in bulk! Hold down Shift and click on any note to enter this mode.',
        ],
      });
    };

    alertAboutUs = () => {
      ReactGA.modalview('modals/about-us');
      this.alert({
        heading: 'Hi!',
        body: [
          'Ela Ben-Ur\'s mission is making powerful ways forward accessible for any person and moment. She distilled Innovators\' Compass from Design Thinking and other practices over a 20-year journey through IDEO, MIT and Olin - and continues to evolve it in collaboration with people around the world, from parents to educators to organizational leaders. More tools and many examples are at <a href="innovatorscompass.org"><u>innovatorscompass.org</u></a>.',
          'My name is Hieu Nguyen, and I am the creator of this app. I am an Olin graduate, class of 2018. Having worked with this design framework from classes with Ela, I saw the potential in an online collaborative Compass and made it a reality.',
          'We offer this app for free so you can move forward with it in challenges big or small. So please:',
          `1. Use and share this!<br/>2. Share back experiences by <a href="mailto:ela@innovatorscompass.org"><u>email</u></a> or <a href="${TWEET}" target="_blank"><u>tweet</u></a>.`,
          'To changing the world for free,',
          'Hieu & Ela',
        ],
      });
    };

    alertRouteErrors(validCode, validUsername) {
      const options = {
        heading: 'There was a problem with your login info',
        body: [],
        cb: () => browserHistory.push('/'),
      };
      if (!validCode) options.body.push('Your code is not valid');
      if (!validUsername) options.body.push('Username can only contain letters, and must not be longer than 15 characters');
      options.body.push('You will now be directed to the login page');

      this.alert(options);
    }

    generatePrompt(html) {
      return this.getModalHtml(
        `${html}<input id="ic-modal-input"/>`,
        '<button id="ic-modal-confirm">Submit</button>',
        '<button id="ic-modal-cancel">Cancel</button>',
      );
    }

    promptForEmail(confirmCb, alwaysSendEmailCb,) {
      let html = `
        <h3>Receive a Link to this Workspace</h3>
        <p>
          You'll need the link to the compass to access it again. To email yourself the link now,
          enter your email address below.
          <br/><br/>
          I will not store your email address or send you spam.
        </p>
        <input id="ic-modal-input" placeholder="enter email or leave blank">
        <div class="ic-always">
          <input type="checkbox" id="ic-always-email-value" /> 
          <span>Always send me the link to workspaces I create</span>
        </div>
      `;

      html = this.getModalHtml(
        html,
        '<button id="ic-modal-confirm">Submit</button>',
      );

      this._prompt(html, confirmCb);

      $('#ic-always-email-value').on('change', (ev) => {
        alwaysSendEmailCb(ev.target.checked);
      });
    }

    promptForCenter(warnFunc, cb) {
      const html = this.getModalHtml(
        `<h3>1. Who\'s involved, including you?</h3>
         <input id="ic-modal-input" />
         <p>For and with everyone involved, explore...</p>`,
        '<button id="ic-modal-confirm">Submit</button>',
      );
      $('#ic-modal-container').empty().append(html);
      $('#ic-modal-input').focus();
      if (__DEV__) {
        $('#ic-modal-input').val('topic-autofilled').select();
      }
      this.addBackdropIfNecessary();
      this.show = true;

      let response;
      $('#ic-modal-confirm').on('click', () => {
        response = $('#ic-modal-input').val();
        if (!response) {
          warnFunc('You can\'t leave this empty');
        } else {
          this.close();
          cb(response);
        }
      });
      $('#ic-modal-cancel').on('click', () => warnFunc('You need to complete this action'));
      $('#ic-backdrop').on('click', () => warnFunc('You need to complete this action'));
    }

    editCenter(currentVal, cb) {
      ReactGA.modalview('modals/edit-center');
      const html = this.getModalHtml(
        `<h3>1. Who\'s involved, including you?</h3>
         <input id="ic-modal-input"/>
         <p>For and with everyone involved, explore...</p>`,
        '<button id="ic-modal-confirm">Submit</button>',
        '<button id="ic-modal-cancel">Cancel</button>',
      );

      $('#ic-modal-container').empty().append(html);
      $('#ic-modal-input').val(currentVal).select();
      this.addBackdropIfNecessary();
      this.show = true;

      $('#ic-modal-confirm').on('click', () => {
        const value = $('#ic-modal-input').val();
        cb(value);
        this.close();
      });
      $('#ic-modal-cancel').on('click', () => {
        this.close();
        cb(null);
      });
      $('#ic-backdrop').on('click', () => {
        this.close();
        cb(null);
      });
    }

    promptForUsername(warn, cb) {
      ReactGA.modalview('modals/prompt-username');
      const html = '<h3>Welcome to this workspace!</h3><p>Please enter your name as it would appear to others:</p>';
      $('#ic-modal-container').empty().append(this.generatePrompt(html));
      $('#ic-modal-input').focus();
      this.addBackdropIfNecessary();
      this.show = true;

      let response;
      $('#ic-modal-confirm').on('click', () => {
        response = $('#ic-modal-input').val();
        if (!response) {
          warn('You can\'t leave this empty');
        } else {
          this.close();
          cb(response);
        }
      });
      $('#ic-modal-cancel').on('click', () => warn('You need to complete this action'));
      $('#ic-backdrop').on('click', () => warn('You need to complete this action'));
    }

    _prompt(html, cb, value = '') {
      $('#ic-modal-container').empty().append(html);
      $('#ic-modal-input').val(value).select();
      this.addBackdropIfNecessary();
      this.show = true;

      let response;
      $('#ic-modal-confirm').on('click', () => {
        response = $('#ic-modal-input').val();
        $(window).off('keydown', this.enterAsSubmit);
        this.close();
        cb(true, response);
      });
      $('#ic-modal-cancel').on('click', () => {
        this.close();
        $(window).off('keydown', this.enterAsSubmit);
        cb(false);
      });
      $('#ic-backdrop').on('click', () => {
        response = $('#ic-modal-input').val();
        $(window).off('keydown', this.enterAsSubmit);
        this.close();
        cb(false, response);
      });

      $(window).on('keydown', this.enterAsSubmit);
    }

    enterAsSubmit(ev) {
      if (ev.which === 13) { // Enter key
        $('#ic-modal-confirm').click();
      }
    }

    prompt({
      heading = '',
      body = '',
      defaultValue = '',
      cb = _.noop,
    }) {
      let bodyHtml = `<h3>${heading}</h3>`;

      if (typeof body === 'string') {
        bodyHtml += `<p>${body}</p>`;
      } else if (body.length > 0) {
        _.each(body, p => bodyHtml += `<p>${p}</p>`);
      }

      bodyHtml += '<input id="ic-modal-input"/>';

      const html = this.getModalHtml(
        bodyHtml,
        '<button id="ic-modal-confirm">Submit</button>',
        '<button id="ic-modal-cancel">Cancel</button>',
      );

      this._prompt(html, cb, defaultValue);
    }

    close() {
      $('#ic-modal-cancel').off('click');
      $('#ic-modal-confirm').off('click');
      $('#ic-backdrop').off('click');
      $('#ic-modal-container').empty();
      this.show = false;
    }
  }

  let instance;

  return {
    getInstance: () => {
      if (instance == null) {
        instance = new Modal();
        instance.constructor = null;
      }

      return instance;
    }
  };
})();

export default ModalSingleton;
