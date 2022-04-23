const { json } = require("express");
const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  qid: {
    type: String,
    required: true,
  },
  reply_id: {
    type: String,
    required: true,
  },
  reply_author: {
    type: String,
    required: true,
  },
  reply_timestamp: {
    type: String,
    required: true,
  },
  reply_text: {
    type: String,
    required: true,
    default: "",
  },
});

const repliesMapSchema = new mongoose.Schema({
  reply_id: String,
  reply_data: replySchema,
});

const discussionForumSchema = new mongoose.Schema({
  question: {
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
  replies: {
    type: Array,
    default: [],
    /*
    of: new mongoose.Schema({
      reply_id: String,
      reply_data: replySchema,
    }),
    */
  },
});

module.exports = mongoose.model("Discussions", discussionForumSchema);
