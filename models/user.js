const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: Date,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [ExerciseSchema],
});

module.exports = mongoose.model("User", UserSchema);
