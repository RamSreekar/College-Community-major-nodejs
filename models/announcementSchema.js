const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  className: {
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
    //default: Date.now,
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  link: {
    type: String,
  },
});

module.exports = mongoose.model("Announcements", announcementSchema);
