const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
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
  username: {
    type: String,
    minLength: 3,
    unique: true,
  },
  resultToken: String,
  tokenExpiration: Date,
});

module.exports = model("User", userSchema);
