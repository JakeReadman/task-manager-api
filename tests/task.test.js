const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOneId, userOne, userTwoId, userTwo, setupDB, taskOne, taskTwo, taskThree } = require('./fixtures/db');

beforeEach(setupDB);

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ description: 'Test' })
        .expect(201);
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.description).toBe('Test');
    expect(task.completed).toBe(false);
});

test('Get all tasks for given user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    expect(response.body.length).toBe(2);
});

test('User should not be able to delete other users task', async () => {
    const response = await request(app)
        .delete(`/task/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);
    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});

//
// Extra Tests To Do
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks
