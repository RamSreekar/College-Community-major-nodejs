const mongoose = require("mongoose");

const registeredUsersSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  pwd: {
    type: String,
    required: true,
  },
  refToken: {
    type: String,
    required: true,
  },
  lastLogin: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", registeredUsersSchema);
