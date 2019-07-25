const app = require('../app');
const User = require('../models/user');

const { userOneId, userOne, userTwo, setupDatabase } = require('./testSetup/db');

// use supertest for route testing
const request = require('supertest');

// 

describe('Users endpoints', () => {

  beforeEach(setupDatabase);

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
    const response = await request(app)
      .post('/users/login')
      .send({
        password: userOne.password,
        email: userOne.email
      })
      .expect(200)
    const user = await User.findById(response.body.user._id);
    const token = response.body.token;

    expect(user.name).toBe(userOne.name);
    expect(user.tokens[0].token).toEqual(userOne.tokens[0].token);

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
    let token = userOne.tokens[0].token;
    const response = await request(app)
      .post('/users/logout')
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200)

    const user = await User.findById(userOne._id);
    expect(user.tokens[user.tokens.length - 1]).not.toEqual(token)

  })

  it('should logout all sessions of a user', async () => {
    const response = await request(app)
      .post('/users/logoutAll')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)

    const user = await User.findById(userOne._id);
    expect(user.tokens.length).toBe(0);
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
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)

    const user = await User.findById(response.body._id);
    expect(user._id).toEqual(userOne._id)

  })

  it('should not get profile for user without token', async () => {
    await request(app)
      .get('/users/me')
      // .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(401)
  })

  it('should delete a user profile', async () => {
    const response = await request(app)
      .delete('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)

    const user = await User.findById(response.body._id);
    expect(user).toBe(null);

  })

  it('should not delete a user profile without token', async () => {
    await request(app)
      .delete('/users/me')
      // .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(401)
  })


})