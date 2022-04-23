const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: "NULL",
  },
});

module.exports = mongoose.model("Opportunities", opportunitySchema);
