require('./db/mongoose')
const Collection = require('./models/collection')

// Collection.findByIdAndUpdate('5d0580771309c041ea50c0f1', { name: 'new articles' })
//   .then((collection) => {
//     console.log(collection)
//     return Collection.countDocuments({ name: 'new articles' })
//   }).then((result) => {
//     console.log(result)
//   }).catch((e) => {
//     console.log(e)
//   })

const newArticles = [
  {
    url: 'http://blajaalbkjflji'
  },
  {
    url: 'http://blajaalbkjflji'
  }
];

const updateArticles = async (id, articles) => {
  const collection = await Collection.findByIdAndUpdate(id, { articles });
  const count = await Collection.countDocuments({ articles });
  return count;
}

// updateArticles('5d0580771309c041ea50c0f1', newArticles).then((count) => {
//   console.log(count)
// }).catch(e => console.log(e))

const deleteCollection = async (id) => {
  const collection = await Collection.findByIdAndDelete(id);
  const count = await Collection.countDocuments({ id });
  return count;
}

deleteCollection('5d07c29a1ae589690d214d55').then((count) => {
  console.log(count)
}).catch(e => console.log(e))