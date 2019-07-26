const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../models/user');
const Collection = require('../../models/collection');
const Thread = require('../../models/thread');

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

// define some threads
const threadOne = {
  owner: userOneId,
  _id: collectionOneId,
  name: `Sourcing of ${collectionOne.articles[0]}`,
  article: {
    PMID: collectionOne.articles[0]
  },
  comments: [
    {
      user: userOne.name,
      text: 'There is a lack of refrerential material in this article.'
    }
  ]
}

const threadTwo = {
  _id: collectionTwoId,
  name: `Data in ${collectionTwo.articles[0]}`,
  article: {
    PMID: collectionTwo.articles[0]
  },
  comments: [
    {
      user: userTwo.name,
      text: 'There is a lack of good data supporting the hypothesis in this article.'
    }
  ]
}

// wipe and setup both the User and Collection schemas for testing
const setupDatabase = async () => {

  await User.deleteMany();
  await Collection.deleteMany();
  await Thread.deleteMany();

  // save one user - userOne
  await new User(userOne).save();

  // save one collection with userOne as its owner
  await new Collection(collectionOne).save();

  // save one collection with userTwo as its owner
  await new Collection(collectionTwo).save();

  // // save one thread with userOne as its owner
  await new Thread(threadOne).save();
}

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  collectionOne,
  collectionTwo,
  collectionThree,
  threadOne,
  threadTwo,
  setupDatabase
}