const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDB } = require('./fixtures/db');

beforeEach(setupDB);

test('Should sign up a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Jake',
            email: 'jake@email.com',
            password: 'mypassW9999',
        })
        .expect(201);

    //Assert that the db was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    //Assersions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Jake',
            email: 'jake@email.com',
        },
        token: user.tokens[0].token,
    });
    expect(user.password).not.toBe('mypassW9999');
});

test('Should log in existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password,
        })
        .expect(200);

    //Fetch user from db
    const user = await User.findById(response.body.user._id);

    //Assert token in response matches second token
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not log in non-existent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'wrong',
            password: 'wrongasda2',
        })
        .expect(400);
});

test('Should get profile for user', async () => {
    await request(app).get('/users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send().expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app).get('/users/me').set('Authorization', `Bearer 123456789assdasdas`).send().expect(401);
});

test('Should delete account for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
    await request(app).get('/users/me').set('Authorization', `Bearer 123456789assdasdas`).send().expect(401);
});

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ name: 'Blobbert' })
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toBe('Blobbert');
});

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ height: 178 })
        .expect(400);

    const user = await User.findById(userOneId);
    expect(user).toMatchObject({
        _id: userOneId,
        name: userOne.name,
        email: userOne.email,
    });
});

//
// Extra Tests to do
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated
