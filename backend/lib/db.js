const mongoose = require('mongoose');

const logger = require('./logger');

const env = process.env.NODE_ENV;
const options = {
  autoReconnect: true,
  reconnectTries: 100,
  reconnectInterval: 2000,
};

let db;

switch (env) {
  case 'production':
    db = mongoose.connect(process.env.MONGODB_URI, options);
    logger.info('Connected to Mongo Lab instance');
    break;

  case 'test':
    db = mongoose.connect(process.env.MONGODB_URI, options);
    logger.info('Connected to Test environment');
    break;

  default:
    db = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/compass');
    logger.info('Connected to local database');
    break;
}

mongoose.connection.on('error', function(e) {
  logger.error('Could not connect to mongoose', e);
});

mongoose.connection.once('open', function() {
  logger.info('Mongodb Connection Successful');
});

module.exports = db;
