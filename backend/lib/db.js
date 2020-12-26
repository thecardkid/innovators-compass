const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const logger = require('./logger');

async function mongooseConnect(uri) {
  return await mongoose.connect(uri, {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: 100,
    reconnectInterval: 2000,
  });
}

async function initializeInMemoryDB() {
  const mongod = new MongoMemoryServer();
  return await mongooseConnect(await mongod.getUri());
}

async function initializeDB() {
  let db;
  if (process.env.NODE_ENV === 'test') {
    db = await initializeInMemoryDB();
  } else {
    db = await mongooseConnect(process.env.MONGODB_URI || 'mongodb://localhost/compass');
  }
  if (db.connections.length) {
    const conn = db.connections[0];
    logger.info(`Connected to Mongo instance ${conn.host}:${conn.port}`);
  }

  mongoose.connection.on('error', function(e) {
    logger.error('Could not connect to mongoose', e);
    throw new Error(e);
  });
  mongoose.set('useFindAndModify', false);
  return db;
}

module.exports = initializeDB;
