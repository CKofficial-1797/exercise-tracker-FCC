const express = require("express");
const router = express.Router();
const User = require("../models/user");


router.post("/users", async (req, res) => {
  try {
    const user = new User({ username: req.body.username });
    const savedUser = await user.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});


router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "username _id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/users/:_id/exercises", async (req, res) => {
  try {
    const { description, duration, date } = req.body;
    const user = await User.findById(req.params._id);

    if (!user) return res.status(404).json({ error: "User not found" });

    const exercise = {
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date(),
    };

    user.log.push(exercise);
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add exercise" });
  }
});

// GET /api/users/:_id/logs?from=..&to=..&limit=..
router.get("/users/:_id/logs", async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const user = await User.findById(req.params._id);

    if (!user) return res.status(404).json({ error: "User not found" });

    let log = user.log;

    if (from) {
      const fromDate = new Date(from);
      log = log.filter(e => new Date(e.date) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      log = log.filter(e => new Date(e.date) <= toDate);
    }

    if (limit) {
      log = log.slice(0, parseInt(limit));
    }

    const formattedLog = log.map(e => ({
      description: e.description,
      duration: e.duration,
      date: new Date(e.date).toDateString(),
    }));

    res.json({
      _id: user._id,
      username: user.username,
      count: formattedLog.length,
      log: formattedLog,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get logs" });
  }
});

module.exports = router;
