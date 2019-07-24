const app = require('../app');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// use supertest for route testing
const request = require('supertest');

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  name: 'Harry',
  password: 'regexmixup',
  email: 'mogget@mail.com',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }
  ]
}
const userTwo = {
  _id: userTwoId,
  name: 'Mark',
  password: 'asufrubf!!!',
  email: 'mark@mail.com',
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }
  ]
}
describe('Collections endpoints', () => {

  beforeEach(async () => {
    await User.deleteMany();
    await new User(userOne).save();
  })

  it('should post a new user', async () => {
    // use the same route as in the actual app
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Charles',
        password: 'regexmixup',
        email: 'harrybell@mail.com'
      })
      .expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull();

    expect(response.body).toMatchObject({
      user: {
        name: 'Charles',
        email: 'harrybell@mail.com'
      },
      token: user.tokens[0].token
    })

    expect(user.password).not.toBe('regexmixup')
  })

  it('should login an existing user', async () => {
    await request(app)
      .post('/users/login')
      .send({
        password: userOne.password,
        email: userOne.email
      })
      .expect(200)
  })

  it('should not login an non-existent user', async () => {
    await request(app)
      .post('/users/login')
      .send({
        password: userTwo.password,
        email: userTwo.email
      })
      .expect(400)
  })

  it('should logout a user', async () => {
    await request(app)
      .post('/users/logout')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
  })

  it('should not logout a user without token', async () => {
    await request(app)
      .post('/users/logout')
      // .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(401)
  })

  it('should not logout a user that is not logged in', async () => {
    await request(app)
      .post('/users/logout')
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .send()
      .expect(401)
  })

  it('should get profile for user', async () => {
    await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
  })

  it('should not get profile for user without token', async () => {
    await request(app)
      .get('/users/me')
      // .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(401)
  })

  it('should delete a user profile', async () => {
    await request(app)
      .delete('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
  })

  it('should not delete a user profile without token', async () => {
    await request(app)
      .delete('/users/me')
      // .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(401)
  })


})