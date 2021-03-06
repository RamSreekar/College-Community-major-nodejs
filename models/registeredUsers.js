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
  userType: {
    type: String,
    required: true,
  },
  refToken: {
    type: String,
    required: true,
  },
  lastLogin: {
    type: String,
  },
  validGroups: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("User", registeredUsersSchema);
