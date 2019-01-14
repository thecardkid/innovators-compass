const router = require('express').Router();

const workspace = require('./workspace');

router.use('/workspace', workspace);

module.exports = router;
