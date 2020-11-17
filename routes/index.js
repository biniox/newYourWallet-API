const express = require('express');
const router = express.Router();

const db = require('./../bin/db/client');


/* GET home page. */
router.get('/',(req, res, next) => {
  res.render('index', { title: 'Express' });
});

module.exports = router;
