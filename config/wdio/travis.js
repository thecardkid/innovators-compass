const userAgent = require('./useragent');

exports.config = {
  specs: [
    './test/e2e/*.spec.js',
  ],
  maxInstances: 1,
  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome',
    chromeOptions: {
      args: [
        `--user-agent=${userAgent}`,
        '--headless',
        '--disable-gpu',
      ],
    },
  }],
  // By default WebdriverIO commands are executed in a synchronous way
  sync: true,
  logLevel: 'silent',
  coloredLogs: true,
  deprecationWarnings: false,
  bail: 0,
  screenshotPath: './errorShots/',
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ['selenium-standalone', 'chromedriver'],
  reporters: ['spec'],
  framework: 'jasmine',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 100000,
    expectationResultHandler: function(passed, assertion) {
      // { matcherName: '',
      //   passed: false,
      //   expected: '',
      //   actual: '',
      //   message: 'Failed: Expected element <#ic-modal-body> to contain text "/Innovator\'s Coimpass/", but only found: The Innovator\'s Compass\nStarting something or feeling stuck? Use five questions, aske',
      //     For more information, visit innovatorscompass.org.
      //     at UserContext.it (/Users/hieunguyen/dev/icompass/test/e2e/help.spec.js:36:38)
      //     at new Promise (<anonymous>)
      //     at new F (/Users/hieunguyen/dev/icompass/node_modules/core-js/library/modules/_export.js:36:28)
      //     message: 'Expected element <#ic-modal-body> to contain text "/Innovator\'s Coimpass/", but only found: The Innovator\'s Compass\nStarting something or feeling stuck? Use five questions, asked by all kinds of innovators, to make things better.\nExplore anything you\'re doing, alone or with others. You\'ll see challenges in new ways.\n1. PEOPLE: Who could be involved? ...including you? For and with everyone involved, explore...\n2. OBSERVATIONS: What\'s happening? Why? What are people doing? Saying? Thinking? Feeling? Why? See all sides, ups and downs.\n3. PRINCIPLES: What matters most for everyone involved? Principles often compete - inspiring us to get creative!\n4. IDEAS: What ways are there? Anyone and anything can help. Look around for ideas! Play with who/what/when/where/how.\n5. EXPERIMENTS: What\'s a step to try? With little time/risk/cost? Do it! What happens for all involved (#1 & 2)?\nReally explore. Look, listen, feel; use words, draw, move, make. In this order (P.O.P.I.E.) or any way that moves you forward.\nFor more information, visit innovatorscompass.org.',
      //     showDiff: false,
      //     actual: '#ic-modal-body',
      //     expected: undefined } }
      if (passed) {
        return;
      }

      console.log(assertion);
      // const cleaned = assertion.to
      // if (!passed) {
      //   browser.saveScreenshot(`tools/travis-wdio-reporter/failures/${i++}.png`);
      // }
    },
  },

  // Hooks
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {Number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // after: function (result, capabilities, specs) {
  // },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // afterSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed after all workers got shut down and the process is about to exit.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onComplete: function(exitCode, config, capabilities) {
    if (exitCode === 1) {

    }
  }
};
