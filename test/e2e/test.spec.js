const { setup, cleanup } = require('./utils');

describe('webdriver.io page', () => {
  it('should have the right title', () => {
    setup();
  });

  it('cleanup', cleanup);
});