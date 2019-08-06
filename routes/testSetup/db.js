const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../models/user');
const Collection = require('../../models/collection');
const Thread = require('../../models/thread');

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();
const userThreeId = new mongoose.Types.ObjectId();
const collectionOneId = new mongoose.Types.ObjectId();
const collectionTwoId = new mongoose.Types.ObjectId();
const collectionThreeId = new mongoose.Types.ObjectId();

// use this to randomize the dates, so we can test the sorting 
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

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
const userThree = {
  _id: userThreeId,
  name: 'Duder',
  password: 'asufrubf!!!',
  email: 'maduder@mail.com',
  tokens: [
    {
      token: jwt.sign({ _id: userThreeId }, process.env.JWT_SECRET)
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
  ],
  createdAt: randomDate(new Date(2016, 0, 1), new Date())
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
  ],
  createdAt: randomDate(new Date(2016, 0, 1), new Date())
}

const collectionThree = {
  _id: collectionThreeId,
  owner: userTwoId, 
  name: 'Neuroscience',
  articles: [
    {
      PMID: '565738290'
    },
    {
      PMID: '246560280'
    }
  ],
  createdAt: randomDate(new Date(2016, 0, 1), new Date())

}

// define some threads
const threadOne = {
  owner: userOneId,
  user: userOne.name,
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
  owner: userTwoId,
  user: userTwo.name,
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

let manyThreads = [];
for (let i = 0; i < 30; i++) {
  let thread = {
    owner: i % 2 === 0 ? userOneId : userTwoId,
    user: `user-${i + 1}`,
    _id: new mongoose.Types.ObjectId(),
    name: Math.random().toString(),
    article: {
      PMID: collectionTwo.articles[0]
    },
    comments: [
      {
        user: userTwo.name,
        text: 'There is a lack of good data supporting the hypothesis in this article.'
      }
    ],
    commentsCount: Math.floor(Math.random() * 100),
    createdAt: randomDate(new Date(2016, 0, 1), new Date())
  }
  manyThreads.push(thread);
}

// wipe and setup both the User and Collection schemas for testing
const setupDatabase = async () => {

  await User.deleteMany();
  await Collection.deleteMany();
  await Thread.deleteMany();

  // save users - userOne + userTow
  await new User(userOne).save();
  await new User(userTwo).save();

  // save one collection with userOne as its owner
  await new Collection(collectionOne).save();

  // save one collection with userTwo as its owner
  await new Collection(collectionTwo).save();

  // save one collection with userTwo as its owner
  await new Collection(collectionThree).save();

  // // save one thread with userOne as its owner
  await new Thread(threadOne).save();

  // then throw some others in there
  for (let i = 0; i < manyThreads.length; i++) {
    await new Thread(manyThreads[i]).save();
  }


}

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  userThree,
  userThreeId,
  collectionOne,
  collectionTwo,
  collectionThree,
  threadOne,
  threadTwo,
  setupDatabase
}