require('babel-polyfill');
const router = require('express').Router();
const compassSchema = require('../../../models/compass');

router.get('/view', async (req, res) => {
  const compass = await compassSchema.findByViewCode(req.query.id);
  res.json({ compass });
});

module.exports = router;
