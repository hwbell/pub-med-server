const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log(token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
    console.log(user)
    if (!user) {
      console.log('no user')
      throw new Error()
    }

    req.user = user;
    req.token = token;
    next();

  } catch(e) {
    res.status(401).send({error: 'Please authenticate!'});
  }
}

module.exports = auth;