let i = 0;

exports.config = {
  specs: [
    './test/e2e/*.spec.js',
  ],
  maxInstances: 1,
  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: [
        '--user-agent=webdriverio-3x6GSoA8HKg2e4BMno9LvsjqcIjXi6',
        // '--headless',
        '--disable-gpu',
      ],
    },
  }],
  runner: 'local',
  hostname: 'localhost',
  port: 4444,
  sync: true,
  logLevel: 'silent',
  coloredLogs: true,
  deprecationWarnings: false,
  bail: 0,
  screenshotPath: './errorShots/',
  // baseUrl: 'http://localhost',
  waitforTimeout: 5000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ['selenium-standalone', 'chromedriver'],
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 100000,
    expectationResultHandler: function(passed) {
      if (!passed) browser.saveScreenshot(`errorShots/${i++}.png`);
    },
  },
};
