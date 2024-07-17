const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minLength: 3,
    maxLength: 8,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 4,
  },
});

module.exports = model("User", userSchema);
