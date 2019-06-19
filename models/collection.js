const mongoose = require('mongoose');
const validator = require('validator');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
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
    default: new Date()
  },
  articles: {
    type: Array,
    required: true,
    validate(array) {
      if (!array.length) {
        throw new Error('Array must not be empty, bruh.')
      }
      array.forEach((article) => {
        if (!article.url) {
          throw new Error('Each article object must have a url')
        } 
      })
    }
  }
})

collectionSchema.pre('save', async function (next) {
  const user = this;

  console.log('just before saving')

  next();
})

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;