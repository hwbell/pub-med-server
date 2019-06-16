var express = require('express');
var router = express.Router();
require('../db/mongoose')
const User = require('../models/user')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  const user = new User(req.body);

  user.save().then(() => {
    res.status(201).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
})

module.exports = router;
