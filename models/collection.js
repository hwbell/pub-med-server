const mongoose = require('mongoose');
const validator = require('validator');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  articles: {
    type: Array,
    required: true,
    validate(array) {
      if (!array.length) {
        throw new Error('Array must not be empty, bruh.')
      }
      
    }
  },
  articlesCount: {
    type: Number,
    default: 0
  }
})

collectionSchema.pre('save', async function (next) {
  const user = this;

  // this will assign the commentsCount to the length of the comments
  // so we don't have to do it manually
  this.articlesCount = this.articles.length;
  next();
})

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;