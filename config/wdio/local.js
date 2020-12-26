const userAgent = require('./useragent');

const headlessArgs = ['--headless', '--disable-gpu'];

exports.config = {
  specs: [
    `./test/e2e/${process.env.SPECS}.spec.js`,
  ],
  maxInstances: 1,
  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: [
        `--user-agent=${userAgent}`,
        ...(process.env.HEADLESS === '1' ? headlessArgs : []),
      ],
    },
  }],
  runner: 'local',
  sync: true,
  logLevel: 'silent',
  coloredLogs: true,
  deprecationWarnings: false,
  bail: 0,
  screenshotPath: './errorShots/',
  baseUrl: 'http://localhost',
  waitforTimeout: 5000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ['selenium-standalone', 'chromedriver'],
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 100000,
    expectationResultHandler: (function () {
      let i = 0;
      return function (passed) {
        if (!passed) {
          browser.saveScreenshot(`errorShots/${i++}.png`);
        }
      };
    })(),
  },
};
