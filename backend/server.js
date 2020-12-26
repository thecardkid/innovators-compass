/* global process: 1 */

let bodyParser = require('body-parser');
let express = require('express');
let helmet = require('helmet');
let path = require('path');
const s3Router = require('react-dropzone-s3-uploader/s3router');

const initializeDB = require('./lib/db');
const logger = require('./lib/logger');
const socket = require('./lib/sockets');
const apiRoutes = require('./routes');

function initApp() {
  let app = express();

  const PORT = process.env.PORT || 8080;
  const staticDir = path.join(__dirname, 'website-dist');

  app.use(express.static(staticDir));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(helmet({
    frameguard: {
      action: 'deny',
    },
    hidePoweredBy: {
      setTo: 'ASP.NET',
    },
    xssFilter: {
      setOnOldIE: true,
    },
  }));

  app.use('/api/v1', logger.api, apiRoutes);

  app.use('/s3', s3Router({
    bucket: process.env.S3_BUCKET || 'innovatorscompass',
    region: 'us-east-2',
    headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'},
    ACL: 'public-read',
    uniquePrefix: true,
  }));


  app.get('*', function(request, response) {
    response.sendFile(path.resolve(staticDir, 'index.html'));
  });

  let db;
  const server = app.listen(PORT, async function() {
    logger.info(`Listening on port ${PORT}`);
    db = await initializeDB();
  });

  socket.connect(server);

  const cleanup = function() {
    logger.info('Disconnecting from MongoDB');
    if (db.connections.length) {
      db.connections[0].close();
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

}

module.exports = initApp();
