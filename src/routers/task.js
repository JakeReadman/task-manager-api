const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/task");

//Create new task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    userId: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//Get all tasks for logged in user
//GET /tasks?completed=bool
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = JSON.parse(req.query.completed.toLowerCase());
  }
  if (req.query.sortBy) {
    const keyVal = req.query.sortBy.split("_");
    const type = keyVal[1] === "asc" ? 1 : -1;
    sort[keyVal[0]] = type;
  }
  try {
    //The line below is fine. Using populate to demo mongoose method
    // const tasks = await Task.find({ userId: req.user._id, completed: completed });
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

//Get task by id
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, userId: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

//Update task by id
router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const updates = req.body;
  const allowedUpdateFields = ["description", "completed"];
  const attemptedUpdateFields = Object.keys(updates);
  const isValidOperation = attemptedUpdateFields.every((field) =>
    allowedUpdateFields.includes(field)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid update fields" });
  }

  try {
    const task = await Task.findOne({ _id, userId: req.user._id });
    if (!task) {
      return res.status(404).send({ error: "No tasks found" });
    }
    attemptedUpdateFields.forEach((update) => (task[update] = updates[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Delete task
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, userId: req.user._id });
    if (!task) {
      return res.status(404).send({ message: "No task found" });
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
