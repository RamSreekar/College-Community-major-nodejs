require("dotenv").config();

const express = require("express");
const discussions = require("../models/discussions");
const router = express.Router();

const Discussion = require("../models/discussions");

router.get("/", (req, res) => {
  res.status(200).send("Discussion-Forums");
});

router.get("/view_all", (req, res) => {
  Discussion.find({}, (err, result) => {
    if (err) throw err;
    res.status(200).send(JSON.stringify(result));
  });
});

router.get("/ques_data", (req, res) => {
  const qid = req.body.qid;
  Discussion.findById(qid, (err, result) => {
    try {
      if (err) throw err;
    } catch {
      console.log("ERROR !!!!!\n" + err);
    }
    if (result == null) res.status(400).json({ msg: "Invalid question ID" });

    res.send(JSON.stringify(result));
  });
});

router.post("/ask", (req, res) => {
  const ques = req.body.question;
  const timestamp = req.body.timestamp;
  const author = req.body.author;

  Discussion.create(
    {
      question: ques,
      author: author,
      timestamp: timestamp,
    },
    (err, result) => {
      if (err) throw err;
      res.status(200).json({ msg: "Question posted successfully." });
    }
  );
});

router.post("/post_reply", (req, res) => {
  const qid = req.body.qid;
  //branch_id = req.body.branch_id;
  const r_timestamp = req.body.timestamp;
  const r_author = req.body.author;
  const r_text = req.body.reply;

  reply_id = qid + "/" + r_author + "/" + r_timestamp;

  reply_json = {
    qid: qid,
    reply_id: reply_id,
    reply_author: r_author,
    reply_timestamp: r_timestamp,
    reply_text: r_text,
  };

  const key_string = reply_id;
  const reply_pair = { reply_id: reply_json };

  data = { $push: { replies: reply_json } };
  Discussion.updateOne({ _id: qid }, data, (err, result) => {
    if (err) throw err;
    res.status(200).json({ msg: "Reply posted successfully." });
  });
});

module.exports = router;
