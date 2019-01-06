const jsonfile = require('jsonfile');
const path = require('path');

const userAgent = require('./useragent');

let i = 0;
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
      if (passed) {
        return;
      }
      const fp = `tools/travis-wdio-reporter/s3-static/images/${i++}.png`;
      browser.saveScreenshot(fp);
      ErrorReporterSingleton.getInstance().enqueueErrorSreenshot({
        filename: fp,
        errorMessage: assertion.message,
      });
    },
  },
  afterTest: function(test) {
    ErrorReporterSingleton.getInstance().maybeAddTestFailure(test);
  },
  after: function (result, capabilities, specs) {
    // result is how many tests failed
    if (result > 0) {
      ErrorReporterSingleton.getInstance().report();
    }
  },
};

const ErrorReporterSingleton = (function() {
  function ErrorReporter() {
    // spec file -> individual test -> failure data
    this.errors = {};
    // With WebdriverIO the screenshot is taken before the
    // error message is known. So we push the screenshot metadata
    // into this queue, and dequeue when we get the corresponding
    // test info.
    // TODO hold on to single object here instead of queue. Queue is overkill
    this.errorScreenshotsQueue = [];
    this.specFileRegex = /icompass\/(test\/e2e\/[a-zA-Z0-9]*\.spec\.js)$/;
  }

  ErrorReporter.prototype = {
    enqueueErrorSreenshot: function({ filename, errorMessage }) {
      this.errorScreenshotsQueue.push({ filename, errorMessage });
    },

    // These arguments are part of the WebdriverIO's afterTest API
    addTestFailure: function({ fullName, file: specFilepath, duration }) {
      const matches = this.specFileRegex.exec(specFilepath);
      const specTruncatedPath = matches[1];
      const screenshotOnHold = this.errorScreenshotsQueue.shift();
      const failureData = {
        screenshot: screenshotOnHold.filename,
        errorMessage: screenshotOnHold.errorMessage,
        testName: fullName,
        durationInMS: duration,
      };
      if (!this.errors[specTruncatedPath]) {
        this.errors[specTruncatedPath] = [];
      }
      this.errors[specTruncatedPath].push({ ...failureData });
    },

    maybeAddTestFailure: function(test) {
      // Only report a test as failed if a screenshot has been enqueued
      if (this.errorScreenshotsQueue.length) {
        this.addTestFailure(test);
      }
    },

    report: function() {
      jsonfile.writeFileSync('tools/travis-wdio-reporter/' + /* TODO */ 'data.json', this.errors);
    },
  };

  let instance;

  return {
    getInstance: () => {
      if (instance == null) {
        instance = new ErrorReporter();
      }

      return instance;
    }
  };
})();

