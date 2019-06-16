var express = require('express');
var router = express.Router();
require('../db/mongoose')
const Collection = require('../models/collection')

// get all the Public Collections
router.get('/', function(req, res, next) {
  Collection.find({}).then((collections) => {
    res.send(collections)
  }).catch(() => {
    res.status(500).send();
  })
})

// get a single Public Collection
router.get('/:id', function(req, res, next) {
  const _id = req.params.id;

  Collection.findById(_id).then((collection) => {
    if (!collection) {
      return res.status(404).send();
    }

    // send the desired collection
    res.send(collection);

  }).catch((e) => {
    res.status(500).send();
  })

})

/* POST a collection */
router.post('/', function(req, res, next) {
  const collection = new Collection(req.body);

  collection.save().then(() => {
    res.status(201).send(collection);
  }).catch((e) => {
    res.status(400).send(e);
  })
})

module.exports = router;
