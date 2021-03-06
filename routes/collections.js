var express = require('express');
var router = express.Router();
require('../db/mongoose')
const auth = require('../middleware/auth');
const Collection = require('../models/collection');
const Thread = require('../models/thread');

// get all the Public Collections
// GET threads (all) with the page + sortBy params. 
// sort the threads accordingly, and send back the page wanted
router.get('/all/:sortBy/:page', async (req, res, next) => {

  let { sortBy, page } = req.params;

  console.log(sortBy, page)

  try {
    let allowedSorters = ['date'];
    if (!allowedSorters.includes(sortBy)) {
      console.log('Invalid or missing sort parameter.')
      return res.status(404).send();
    }

    page = Number(page);
    if (page === NaN) {
      return res.status(404).send('Invalid or missing page parameter.');
    }

    let threads;

    collections = await Collection.find({}).sort({ createdAt: -1 })

    let start = page * 10 - 10;
    let end = page * 10;

    console.log('just before sending')
    res.send(collections.slice(start, end));

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }

})

// get a single Public Collection
router.get('/single/:id', async (req, res, next) => {

  const _id = req.params.id;

  try {
    // const collection = await Collection.findById(_id);
    const collection = await Collection.findOne({ _id })

    if (!collection) {
      return res.status(404).send();
    }

    res.send(collection);

  } catch (e) {
    res.status(404).send();
  }

})

// get a user's profile / Collections / Threads - should move this probably
router.get('/me', auth, async (req, res, next) => {

  // console.log('get request for users collections')
  try {
    const collections = await Collection.find({ owner: req.user._id });
    const threads = await Thread.find({ owner: req.user._id })

    res.send({
      user: req.user,
      collections,
      threads
    });
  } catch (e) {
    console.log(e)
    res.status(500).send(e);
  }

})

/* POST a new collection */
router.post('/', auth, async (req, res, next) => {

  const collection = new Collection({
    ...req.body,
    owner: req.user._id
  })

  try {
    await collection.save();
    const updatedCollection = await Collection.findOne({ _id: collection._id, owner: req.user._id })
    res.status(201).send(updatedCollection);
  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }

})

/* PATCH a single collection */
router.patch('/:id', auth, async (req, res) => {
  const _id = req.params.id;
  
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'articles'];
  const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Invalid update.'
    })
  }

  try {
    const collection = await Collection.findOne({ _id, owner: req.user._id })
    // const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      collection[update] = req.body[update];
    });
    collection.lastUpdated = new Date();

    await collection.save();

    // send the new list back
    const collections = await Collection.findOne({ _id, owner: req.user._id });
    res.status(201).send(collections);

  } catch (e) {
    res.status(400).send(e);
  }
})

// delete a user's collection
router.delete('/:id', auth, async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!collection) {
      return res.status(404).send();
    }
    // send the new list back
    const collections = await Collection.find({ owner: req.user._id });
    res.send(collections);
  } catch (e) {
    res.statusCode(400).send;
  }
})

module.exports = router;
