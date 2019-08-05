const mongoose = require('mongoose');
const validator = require('validator');

const threadSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  user: {
    type: String,
    // unique: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  article: {
    type: Object,
    required: true,
    validate(obj) {
      if (!obj) {
        throw new Error('Need an article to start thread')
      }
    }
  },
  paragraph: {
    type: String,
    // required: true,
  },
  comments: {
    type: Array,
    // required: true,
    default: []
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
})

threadSchema.pre('save', async function (next) {

  // this will assign the commentsCount to the length of the comments
  // so we don't have to do it manually
  this.commentsCount = this.comments.length;
})

const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;