const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Blogger = mongoose.model("Blogger", userSchema);
module.exports = Blogger;
