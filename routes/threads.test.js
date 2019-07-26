const app = require('../app');
const Thread = require('../models/thread.js');


const { userOne, userTwo, threadOne, threadTwo, setupDatabase } = require('./testSetup/db');

// use supertest for route testing
const request = require('supertest');

describe('Threads endpoints', () => {
  beforeEach(setupDatabase);

  it('should post a new thread', async () => {
    const response = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(threadTwo)
      .expect(201)
    // console.log(response.body)

    const thread = await Thread.findOne({ name: threadOne.name });
    expect(thread).not.toBeNull();
  })

  it('should get a users threads', async () => {

    // post a thread on top of the existing one
    const post = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(threadTwo)
      .expect(201)

    // get all the user's threads, should be 2 there now
    const get = await request(app)
      .get('/threads/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .expect(200)

    // console.log(get.body)
    expect(get.body.length).toBe(2)
  })

  it('should get a single thread', async () => {

    let id = threadOne._id.toString();

    const get = await request(app)
      .get(`/threads/single/${id}`)
      .expect(200)
  })

  it('should patch a threads info', async () => {

    let threadPatch = {
      paragraph: 'Additional info and sources ... '
    }
    const patch = await request(app)
      .patch(`/threads/${threadOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(threadPatch)
      .expect(201)

    const thread = await Thread.findOne({ paragraph: 'Additional info and sources ... ' });
    expect(thread.name).toBe(threadOne.name)
  })

  it('should modify a threads comments', async () => {

    // define the comment to be added
    const commentsPatch = {
      user: userTwo.name,
      text: 'There is a lack of good data supporting the hypothesis in this article.',
      add: true
    }

    // patch the thread with the new comment
    const patch = await request(app)
      .patch(`/threads/comments/${threadOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(commentsPatch)
      .expect(201)

    // assert it worked
    let thread = await Thread.findOne({ _id: threadOne._id });
    expect(thread.comments[thread.comments.length - 1]).toMatchObject(commentsPatch);

    // define the comment to be removed
    const commentsRemove = threadOne.comments[0];

    // now try removing the first pre-existing comment
    const remove = await request(app)
      .patch(`/threads/comments/${threadOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(commentsRemove)
      .expect(201)

    // assert it worked - now the first comment should be the one we added, and there should be only 1 comment
    thread = await Thread.findOne({ _id: threadOne._id });
    expect(thread.comments[0]).toMatchObject(commentsPatch);
    console.log(thread.comments[0])

  })

  it('should delete thread', async () => {
    const patch = await request(app)
      .delete(`/threads/${threadOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .expect(200)

    const thread = await Thread.findOne({ _id: threadOne._id });
    expect(thread).toBeNull();

  })
})

