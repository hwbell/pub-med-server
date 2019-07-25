const app = require('../app');
const Collection = require('../models/collection');

const { userOne, userTwo, setupDatabase, collectionOne, collectionThree } = require('./testSetup/db');

// use supertest for route testing
const request = require('supertest');

// 

describe('Collections endpoints', () => {

  beforeEach(setupDatabase);

  it('should get the public collections', async () => {
    const response = await request(app)
      .get('/collections')
      .expect(200)
    expect(response.body.length).toBe(2)
  })

  it('should get a users collections', async () => {
    const response = await request(app)
      .get('/collections/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .expect(200)
    
    expect(response.body.length).toBe(1)
    console.log(response.body[0]._id)
    const collection = await Collection.findById(response.body[0]._id);
    expect(collection.name).toBe(collectionOne.name)
  })

  it('should get a collection by id', async () => {
    let id = collectionOne._id.toString();
    console.log(`/collections/single/${id}`)
    const response = await request(app)
      .get(`/collections/single/${id}`)
      .expect(200)
    expect(response.body.name).toBe(collectionOne.name)
  })

  it('should post a new collection', async () => {
    const response = await request(app)
      .post('/collections')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(collectionThree)
      .expect(201)
    console.log(response.body.length)

    // check the second item, since we had already inserted a collection before
    const collection = await Collection.findById(response.body[1]._id);
    expect(collection.name).toBe(collectionThree.name)
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
    const collection = await Collection.findById(response.body[0]._id);
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