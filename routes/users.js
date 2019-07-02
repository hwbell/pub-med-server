var express = require('express');
var router = express.Router();

require('../db/mongoose');
const User = require('../models/user');
const auth = require('../middleware/auth');

/* GET user's profile (logged in)*/
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

/* POST a new user */
router.post('/', async (req, res, next) => {
  const user = new User(req.body);
  console.log( req.body || 'nothing received' )

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

// logout a user
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    })
    await req.user.save();

    res.send();
  } catch(e) {
    res.status(500).send();
  }
})

// logout of all sessions / wipe the tokens array
router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch(e) {
    res.status(500).send();
  }
})

// delete a user
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch(e) {
    res.status(500).send();
  }
})


module.exports = router;
