const userAgent = require('./useragent');

const headlessArgs = ['--headless', '--disable-gpu'];

let i = 0;
exports.config = {
  specs: [
    `./test/e2e/${process.env.SPECS}.spec.js`,
  ],
  maxInstances: 1,
  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome',
    chromeOptions: {
      args: [
        `--user-agent=${userAgent}`,
        ...(process.env.HEADLESS ? headlessArgs : []),
      ],
    },
  }],
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
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 100000,
    expectationResultHandler: function (passed, assertion) {
      const fp = `errorShots/${i++}.png`;
      if (!passed) {
        browser.saveScreenshot(fp);
      }
    },
  },
  /**
   * Hook that gets executed before the suite starts
   * @param {Object} suite suite details
   */
  beforeSuite: function(suite) {
    // eslint-disable-next-line no-console
    console.log(`\nExecuting: ${suite.title}.spec.js`);
  },
};

