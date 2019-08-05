const app = require('../app');
const Thread = require('../models/thread.js');
const { compareDates } = require('../tools/helperFunctions');

const { userOne, userTwo, userThree, threadOne, threadTwo, setupDatabase } = require('./testSetup/db');

// use supertest for route testing
const request = require('supertest');

describe('Threads endpoints', () => {
  beforeEach(setupDatabase);

  it('should post a new thread', async () => {
    const post = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(threadTwo)
      .expect(201)
    // console.log(response.body)

    const thread = await Thread.findOne({ _id: threadTwo._id });
    expect(thread.name).toBe(threadTwo.name)

    expect(post.body.name).toBe(threadTwo.name)
  })

  it('should get all threads according to date sorter', async () => {
    let sortBy = 'date';
    let page = 1;

    const get = await request(app)
      .get(`/threads/all/${sortBy}/${page}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .expect(200)

    let threads = get.body;

    expect(threads.length).toBe(10);
    
    // check if they are actually sorted
    let check = threads.every((thread, i) => {
      
      // check the date is more recent than the next thread in line, if its there
      let nextThread = threads[i+1];
      if (nextThread) {
        return compareDates(thread.createdAt, nextThread.createdAt)
      }
      // this means we're at the end
      return true;
    })

    expect(check).toBe(true);
  })

  it('should get all threads according to comments sorter', async () => {
    let sortBy = 'comments';
    let page = 2;

    const get = await request(app)
      .get(`/threads/all/${sortBy}/${page}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .expect(200)

    let threads = get.body;

    expect(threads.length).toBe(10);
    
    // check if they are actually sorted
    let check = threads.every((thread, i) => {
      
      // check the date is more recent than the next thread in line, if its there
      let nextThread = threads[i+1];

      if (nextThread) {
        console.log(thread.commentsCount, nextThread.commentsCount)
        return thread.commentsCount >= nextThread.commentsCount
      }
      // this means we're at the end
      return true;
    })

    expect(check).toBe(true);
  })

  it('should get a users threads', async () => {

    // get all the user's threads, should be 16 there now
    const userOneResponse = await request(app)
      .get('/threads/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .expect(200)

    // console.log(get.body)
    expect(userOneResponse.body.length).toBe(16)

    const userTwoResponse = await request(app)
      .get('/threads/me')
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .expect(200)

    // console.log(get.body)
    expect(userTwoResponse.body.length).toBe(15)

  })

  it('should get a single thread', async () => {

    let _id = threadOne._id.toString();

    const get = await request(app)
      .get(`/threads/single/${_id}`)
      .expect(200)

      expect(get.body._id).toBe(threadOne._id.toString())
      expect(get.body.owner).toBe(userOne._id.toString())

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

    expect(patch.body._id).toBe(thread._id.toString());
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

    expect(patch.body._id).toBe(thread._id.toString());
    expect(thread.commentsCount).toBe(thread.comments.length)


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
    
    expect(remove.body._id).toBe(thread._id.toString());    

  })

  it('should delete thread', async () => {
    const patch = await request(app)
      .delete(`/threads/${threadOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .expect(200)

    const thread = await Thread.findOne({ _id: threadOne._id });
    expect(thread).toBeNull();

    // assert we get the user's threads back, length being -1 from above
    expect(patch.body.length).toBe(15);
    
    patch.body.forEach( (item) => {
      expect(item.owner).toBe(userOne._id.toString());
    });

  })

})

