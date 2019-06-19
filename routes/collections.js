var express = require('express');
var router = express.Router();
require('../db/mongoose')
const auth = require('../middleware/auth');
const Collection = require('../models/collection');

// get all the Public Collections
router.get('/', async (req, res, next) => {

  try {
    const collections = await Collection.find({});
    res.send(collections);
  } catch (e) {
    res.status(500).send(e);
  }

})

// get a user's Collections
router.get('/me', auth, async (req, res, next) => {

  try {
    const collections = await Collection.find({ owner: req.user._id });
    res.send(collections);
  } catch (e) {
    res.status(500).send(e);
  }

})

/* POST a new collection */
router.post('/', auth, async (req, res, next) => {
  console.log(req.body)
  const collection = new Collection({
    ...req.body,
    owner: req.user._id
  })

  try {
    await collection.save();
    res.status(201).send(collection);
  } catch (e) {
    res.status(400).send(e);
  }

})

// get a single Public Collection
router.get('/:id', auth, async (req, res, next) => {
  const _id = req.params.id;

  try {
    // const collection = await Collection.findById(_id);
    const collection = await Collection.findOne({ _id, owner: req.user._id }) 
    
    if (!collection) {
      return res.status(404).send();
    }

    res.send(collection);

  } catch (e) {
    res.status(404).send();
  }

})

/* Update an single collection */
router.patch('/:id', auth, async (req, res) => {
  const id = req.params.id;
  
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'articles', 'lastUpdated'];
  const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Invalid update.'
    })
  }

  try {
    const collection = await Collection.findOne({ _id: req.params.id, owner: req.user._id})
    // const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).send();
    }
    
    updates.forEach((update) => {
      collection[update] = req.body[update];
    });
    await collection.save();

    res.send(collection);

  } catch(e) {  
    res.status(400).send(e);
  }
})

module.exports = router;
