var express = require('express');
var router = express.Router();

require('../db/mongoose');
const User = require('../models/user');
const auth = require('../middleware/auth');

/* GET all users */
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

// get a single user
router.get('/:id', async (req, res, next) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }

    res.send(user);

  } catch (e) {
    res.status(404).send();
  }

})

/* POST a new user */
router.post('/', async (req, res, next) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }

});

// login a user
router.post('/login', async (req, res) => {

  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
})

module.exports = router;
