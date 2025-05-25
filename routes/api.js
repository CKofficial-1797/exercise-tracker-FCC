const express = require("express");
const router = express.Router();
const User = require("../models/user");

// POST /api/users
router.post("/users", async (req, res) => {
  const user = new User({ username: req.body.username });
  const savedUser = await user.save();
  res.json({ username: savedUser.username, _id: savedUser._id });
});

// GET /api/users
router.get("/users", async (req, res) => {
  const users = await User.find({}, "username _id");
  const formattedUsers = users.map(user => ({
    username: user.username,
    _id: user._id
  }));
  res.json(formattedUsers);
});

// POST /api/users/:_id/exercises
router.post("/users/:_id/exercises", async (req, res) => {
  const { description, duration, date } = req.body;
  const user = await User.findById(req.params._id);

  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date(),
  };

  user.log.push(exercise);
  await user.save();

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: user._id,
  });
});

// GET /api/users/:_id/logs
router.get("/users/:_id/logs", async (req, res) => {
  const { from, to, limit } = req.query;
  const user = await User.findById(req.params._id);

  let log = user.log;

  if (from) log = log.filter((e) => new Date(e.date) >= new Date(from));
  if (to) log = log.filter((e) => new Date(e.date) <= new Date(to));
  if (limit) log = log.slice(0, parseInt(limit));

  const formattedLog = log.map((e) => ({
    description: e.description,
    duration: e.duration,
    date: new Date(e.date).toDateString(),
  }));

  res.json({
    username: user.username,
    count: formattedLog.length,
    _id: user._id,
    log: formattedLog,
  });
});

module.exports = router;
