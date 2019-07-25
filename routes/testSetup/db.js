const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../models/user');
const Collection = require('../../models/collection');

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();
const collectionOneId = new mongoose.Types.ObjectId();
const collectionTwoId = new mongoose.Types.ObjectId();


// define some users and collections - when we initialize the database below, we will
// save one user(userOne) with one collection(collectionOne)
const userOne = {
  _id: userOneId,
  name: 'Jeff',
  password: 'regexmixup',
  email: 'mogget@mail.com',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }
  ]
}
const userTwo = {
  _id: userTwoId,
  name: 'Mark',
  password: 'asufrubf!!!',
  email: 'mark@mail.com',
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }
  ]
}

const collectionOne = {
  _id: collectionOneId,
  owner: userOneId, 
  name: 'Cancer Biology',
  articles: [
    {
      PMID: '294378234'
    },
    {
      PMID: '310460980'
    }
  ]
}

const collectionTwo = {
  _id: collectionTwoId,
  owner: userTwoId, 
  name: 'Immunology',
  articles: [
    {
      PMID: '324926597'
    },
    {
      PMID: '987984637'
    }
  ]
}

const collectionThree = {
  // _id: collectionTwoId,
  // owner: userTwoId, 
  name: 'Neuroscience',
  articles: [
    {
      PMID: '565738290'
    },
    {
      PMID: '246560280'
    }
  ]
}

// wipe and setup both the User and Collection schemas
const setupDatabase = async () => {

  await User.deleteMany();
  await Collection.deleteMany();

  // save one user - userOne
  await new User(userOne).save();
  // save one collection with userOne as its owner
  await new Collection(collectionOne).save();
  await new Collection(collectionTwo).save();

}

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  collectionOne,
  collectionTwo,
  collectionThree,
  setupDatabase
}