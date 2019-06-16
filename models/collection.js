const mongoose = require('mongoose');
const validator = require('validator');

const Collection = mongoose.model('Collection', {
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: String,
    default: "anonymous",
    trim: true
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
});

module.exports = Collection;