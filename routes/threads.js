var express = require('express');
var router = express.Router();
require('../db/mongoose')
const auth = require('../middleware/auth');
const Thread = require('../models/thread');

/* POST a new thread */
router.post('/', auth, async (req, res, next) => {
  const thread = new Thread({
    ...req.body,
    owner: req.user._id
  })

  try {
    await thread.save();
    const threads = await Thread.find({ owner: req.user._id });
    res.status(201).send(threads);
  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }

})

// GET threads (all) with the page param. 
// sort the threads accordingly, and send back the page wanted
router.get('/all/:sortBy/:page', auth, async (req, res, next) => {

  let { sortBy, page } = req.params;

  console.log(sortBy, page)

  try {
    let allowedSorters = ['date', 'comments'];
    if (!allowedSorters.includes(sortBy)) {
      console.log('Invalid or missing sort parameter.')
      return res.status(404).send();
    }

    page = Number(page);
    if (page === NaN) {
      return res.status(404).send('Invalid or missing page parameter.');
    }

    let threads;

    if (sortBy === 'comments') {
      threads = await Thread.find({}).sort({ commentsCount: -1 })
    } else {
      threads = await Thread.find({}).sort({ createdAt: -1 })
    }

    let start = page * 10 - 10;
    let end = page * 10;

    console.log('just before sending')
    res.send(threads.slice(start, end));

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }

})

/* GET a single thread */
router.get('/single/:id', async (req, res, next) => {

  console.log('request for single thread')

  const _id = req.params.id;

  try {
    const threads = await Thread.findOne({ _id });

    if (!threads) {
      return res.status(404).send();
    }

    res.send(threads);

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
})

/* GET user's threads */
router.get('/me', auth, async (req, res, next) => {
  try {
    const threads = await Thread.find({ owner: req.user._id });

    if (!threads) {
      return res.status(404).send();
    }

    res.send(threads);

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
})

/* PATCH a user's thread info */
router.patch('/:id', auth, async (req, res, next) => {

  // console.log(req.body)
  const updates = Object.keys(req.body);
  const allowedUpdates = ['paragraph', 'name'];
  const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Invalid update.'
    })
  }

  try {
    const thread = await Thread.findOne({ _id: req.params.id, owner: req.user._id })
    // const collection = await Collection.findById(req.params.id);

    if (!thread) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      thread[update] = req.body[update];
    });
    thread.lastUpdated = new Date();

    await thread.save();

    // send the new list back
    const threads = await Thread.find({});
    res.status(201).send(threads);

  } catch (e) {
    res.status(400).send(e);
  }

})

/* PATCH a thread's comments */
router.patch('/comments/:id', auth, async (req, res, next) => {
  const _id = req.params.id;
  const newComment = req.body;

  if (!newComment || !newComment.text || !newComment.user) {
    res.status(400).send({
      error: 'Invalid comments entry.'
    })
  }

  try {
    // get the thread from the db
    const thread = await Thread.findOne({ _id });
    // console.log(thread)

    if (!thread) {
      return res.status(404).send();
    }

    // if its an addition, add the comment onto the comments
    if (newComment.add) {
      console.log('adding comment')
      newComment.createdAt = new Date();

      thread.comments.push(newComment);
    }
    // otherwise, remove it
    else {
      let comments = thread.comments;
      comments = comments.filter(comment => comment.text !== newComment.text);
      thread.comments = comments;
    }

    thread.lastUpdated = new Date();
    await thread.save();

    // send the new list back
    const threads = await Thread.find({});
    res.status(201).send(threads);

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }

})

/* DELETE a user's thread */
router.delete('/:id', auth, async (req, res) => {
  try {
    const thread = await Thread.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!thread) {
      return res.status(404).send();
    }
    // send the new list back
    const threads = await Thread.find({ owner: req.user._id });
    res.send(threads);
  } catch (e) {
    res.statusCode(400).send;
  }
})

module.exports = router;
