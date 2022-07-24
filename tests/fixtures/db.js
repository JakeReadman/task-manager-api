const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: 'Test Name',
    email: 'test@test.com',
    password: 'testyMcTesticles',
    tokens: [
        {
            token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
        },
    ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: 'Test Name 2',
    email: 'test2@test.com',
    password: 'testyMcTesticles2',
    tokens: [
        {
            token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
        },
    ],
};

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task description',
    completed: false,
    userId: userOneId,
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task description 2',
    completed: true,
    userId: userOneId,
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task description 3',
    completed: true,
    userId: userTwoId,
};

const setupDB = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
};

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    setupDB,
    taskOne,
    taskTwo,
    taskThree,
};
