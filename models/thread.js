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
    unique: true,
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
  }
})

// threadSchema.pre('save', async function (next) {
//   const thread = this;

//   // console.log('just before saving')

//   next();
// })

const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;