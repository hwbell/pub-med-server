const app = require('../app');
const Collection = require('../models/collection');
const User = require('../models/user');
const Thread = require('../models/thread');
const { userOne, userTwo, setupDatabase, collectionOne, collectionThree, threadOne } = require('./testSetup/db');
const { compareDates } = require('../tools/helperFunctions');
// use supertest for route testing
const request = require('supertest');
const mongoose = require('mongoose');

// 

describe('Collections endpoints', () => {

  beforeEach(setupDatabase);

  it('should get all collections, paginated, according to date sorter', async () => {
    let sortBy = 'date';
    let page = 1;

    const get = await request(app)
      .get(`/collections/all/${sortBy}/${page}`)
      .expect(200)

    let collections = get.body;

    expect(collections.length).toBe(3);

    // check if they are actually sorted
    let check = collections.every((collection, i) => {

      // check the date is more recent than the next thread in line, if its there
      let nextCollection = collections[i + 1];
      if (nextCollection) {
        return compareDates(collection.createdAt, nextCollection.createdAt)
      }
      // this means we're at the end
      return true;
    })

    expect(check).toBe(true);
  })

  it('should get a users collections and profile and threads', async () => {
    const response = await request(app)
      .get('/collections/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .expect(200)

    expect(response.body.collections.length).toBe(1)
    expect(response.body.threads.length).toBe(16)

    const collection = await Collection.findById(response.body.collections[0]._id);
    expect(collection.name).toBe(collectionOne.name)

    const thread = await Thread.findById(response.body.threads[0]._id);
    expect(thread.name).toBe(threadOne.name)

    const user = await User.findById(response.body.user._id);
    expect(user.name).toBe(userOne.name)
  })

  it('should get a collection by id', async () => {
    const id = collectionOne._id.toString();
    // console.log(`/collections/single/${id}`)
    const response = await request(app)
      .get(`/collections/single/${id}`)
      .expect(200)
    expect(response.body.name).toBe(collectionOne.name)
  })

  it('should post a new collection', async () => {

    let newCollection = JSON.parse(JSON.stringify(collectionThree));
    // change the unique props 
    newCollection._id = new mongoose.Types.ObjectId();
    newCollection.name = 'A new name!';

    const response = await request(app)
      .post('/collections')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(newCollection)
      .expect(201)
    console.log(response.body)

    // check the second item, since we had already inserted a collection before
    const collection = await Collection.findById(response.body._id);
    expect(collection.name).toBe(newCollection.name)

    collection.articles.forEach((article, i) => {
      expect(article).toMatchObject(newCollection.articles[i])
    })
  })

  it('should patch an existing collection', async () => {
    let id = collectionOne._id.toString();

    const response = await request(app)
      .patch(`/collections/${id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        name: 'Biomedical',
      })
      .expect(201)
    const collection = await Collection.findById(response.body._id);
    expect(collection.name).toBe('Biomedical')
  })

  it('should delete a collection', async () => {
    let id = collectionOne._id.toString();

    const response = await request(app)
      .delete(`/collections/${id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .expect(200)
    const collection = await Collection.findById(id);
    expect(collection).toBe(null)
  })

})