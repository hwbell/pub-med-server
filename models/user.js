const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Collection = require('./collection')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // unique: true,
    // required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain the word "password", thats crazy')
      }
    }
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is not valid')
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number!')
      }
    }
  },
  about: {
    type: String
  },
  research: {
    type: String
  },
  affiliations: {
    type: String
  },
  interests: {
    type: String
  },

  tokens: [
    { 
      token: {
        type: String,
        required: true
      } 
    }
  ]
})

userSchema.virtual('collections', {
  ref: 'Collection',
  localField: '_id',
  foreignField: 'owner'
})

// methods available on instances
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
}

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  
  return token;
}

// statics available on models
userSchema.statics.findByCredentials = async (email, password) => {
  console.log('looking ... ')
  const user = await User.findOne({ email });
  console.log('user found')

  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to logn')
  }

  return user;
}

// Hash the plaintext password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
})

// Delete the user's collections if they delete their profile
userSchema.pre('remove', async function (next) {
  const user = this;

  await Collection.deleteMany({ owner: user._id});

  next();
})

const User = mongoose.model('User', userSchema);
User.createIndexes();

module.exports = User;