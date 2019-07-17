const mongoose = require('mongoose');

const localMongoUrl = 'mongodb://127.0.0.1:27017/pub-meb-server-api';
const herokuMongoUrl = process.env.MONGODB_URI;

mongoose.connect(herokuMongoUrl || localMongoUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})

