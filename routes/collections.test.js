const app = require('../app');
// const Collection = require('../models/collection');

const { userOne, userTwo, setupDatabase, collectionThree } = require('./testSetup/db');

// use supertest for route testing
const request = require('supertest');

// 

describe('Users endpoints', () => {

  beforeEach(setupDatabase);

  it('should get the public collections', async () => {
    const response = await request(app)
      .get('/collections')
      .expect(200)
    expect(response.body.length).toBe(2)
  })

  it('should post a new collection', async () => {
    const response = await request(app)
      .post('/collections')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(collectionThree)
      .expect(201)
  })


})