require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Announcements = require("../models/announcementSchema");
const Notes = require("../models/notesSchema");

router.get("/", (req, res) => {
  res.status(200).send("<h1>Announcements</h1>");
});

router.get("/view_all/posts/:classId", (req, res) => {
  const className = req.params.classId;
  Announcements.find({ className: className }, (err, result) => {
    if (err) throw err;
    res.status(200).send(JSON.stringify(result));
  });
});

router.get("/view_all/notes/:classId", (req, res) => {
  const className = req.params.classId;
  Notes.find({ className: className }, (err, result) => {
    if (err) throw err;
    res.status(200).send(JSON.stringify(result));
  });
});

router.post("/post", (req, res) => {
  const title = req.body.title;
  const className = req.body.className;
  const author = req.body.author;
  const timestamp = req.body.timestamp;
  const content = req.body.content;
  const imageUrl = req.body.imageUrl;
  const link = req.body.link;

  Announcements.create(
    {
      title: title,
      className: className,
      author: author,
      timestamp: timestamp,
      content: content,
      imageUrl: imageUrl,
      link: link,
    },
    (err, result) => {
      if (err) throw err;
      res.status(200).json({ msg: "Announcement posted successfully." });
    }
  );
});

router.post("/post/notes", (req, res) => {
  const title = req.body.title;
  const className = req.body.className;
  const author = req.body.author;
  const timestamp = req.body.timestamp;
  const content = req.body.content;
  const imageUrl = req.body.imageUrl;
  const link = req.body.link;

  Notes.create(
    {
      title: title,
      className: className,
      author: author,
      timestamp: timestamp,
      content: content,
      imageUrl: imageUrl,
      link: link,
    },
    (err, result) => {
      if (err) throw err;
      res.status(200).json({ msg: "Notes uploaded successfully." });
    }
  );
});

router.get("/post_data", (req, res) => {
  const ann_id = req.body.oppId;
  Announcements.findById(ann_id, (err, result) => {
    try {
      if (err) throw err;
    } catch {
      console.log("ERROR !!!!!\n" + err);
    }
    if (result == null) res.status(400).json({ msg: "Invalid post ID" });

    res.send(JSON.stringify(result));
  });
});

module.exports = router;
