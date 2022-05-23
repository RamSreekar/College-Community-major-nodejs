require("dotenv").config();

const express = require("express");
const router = express.Router();

const Opportunities = require("../models/opportunitySchema");

router.get("/view_all", (req, res) => {
  Opportunities.find({}, (err, result) => {
    if (err) throw err;
    res.status(200).send(JSON.stringify(result));
  });
});

router.post("/post", (req, res) => {
  const content = req.body.content;
  const timestamp = req.body.timestamp;
  const author = req.body.author;
  const title = req.body.title;
  const link = req.body.link;

  Opportunities.create(
    {
      content: content,
      author: author,
      timestamp: timestamp,
      title: title,
      link: link,
    },
    (err, result) => {
      if (err) throw err;
      res.status(200).json({ msg: "Oppotunity posted successfully." });
    }
  );
});

router.post("/opp_data", (req, res) => {
  const opp_id = req.body.oppId;
  Opportunities.findById(opp_id, (err, result) => {
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
