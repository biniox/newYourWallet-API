const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/purpose', (req, res, next) => {
  res.send('respond with a resource');
});

module.exports = router;