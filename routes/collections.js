var express = require('express');
var router = express.Router();
require('../db/mongoose')
const Collection = require('../models/collection')

// get all the Public Collections
router.get('/', async (req, res, next) => {

  try {
    const collections = await Collection.find({});
    res.send(collections);
  } catch (e) {
    res.status(500).send(e);
  }

})

// get a single Public Collection
router.get('/:id', async (req, res, next) => {
  const _id = req.params.id;

  try {
    const collection = await Collection.findById(_id);
    if (!collection) {
      return res.status(404).send();
    }

    res.send(collection);

  } catch (e) {
    res.status(404).send();
  }

})

/* POST a new collection */
router.post('/', async (req, res, next) => {
  const collection = new Collection(req.body);

  try {
    await collection.save();
    res.status(201).send(collection);
  } catch (e) {
    res.status(400).send(e);
  }

})

/* Update an single collection */
router.patch('/:id', async (req, res) => {
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
    const collection = await Collection.findById(req.params.id);
    
    updates.forEach((update) => {
      collection[update] = req.body[update];
    });
    await collection.save();

    if (!collection) {
      return res.status(404).send();
    }

    res.send(collection);

  } catch(e) {  
    res.status(400).send(e);
  }
})

module.exports = router;
