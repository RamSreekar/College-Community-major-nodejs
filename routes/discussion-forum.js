require("dotenv").config();

const express = require("express");
const discussions = require("../models/discussions");
const router = express.Router();

const Discussion = require("../models/discussions");

router.get("/", (req, res) => {
  res.status(200).send("Discussion-Forums");
});

router.post("/view_all", (req, res) => {
  const branchId = req.body.branchId;
  Discussion.find({ branch: branchId }, (err, result) => {
    if (err) throw err;
    res.status(200).send(JSON.stringify(result));
  });
});

router.post("/ques_data", (req, res) => {
  const qid = req.body.qid;
  Discussion.findById(qid, (err, result) => {
    try {
      if (err) throw err;
    } catch {
      console.log("ERROR !!!!!\n" + err);
    }
    if (result == null) return res.status(400).json({ msg: "Invalid question ID" });

    return res.status(200).send(JSON.stringify(result));
  });
});

router.post("/ask", (req, res) => {
  const title = req.body.title;
  const branch = req.body.branch;
  const body = req.body.body;
  const timestamp = req.body.timestamp;
  const author = req.body.author;

  Discussion.create(
    {
      title: title,
      branch: branch,
      body: body,
      author: author,
      timestamp: timestamp,
      flagType : 0,
      numFlags : 0
    },
    (err, result) => {
      if (err) throw err;
      res.status(200).json({ msg: "Question posted successfully." });
    }
  );
});

router.post("/post_reply/new", (req, res) => {
  const qid = req.body.qid;
  //branch_id = req.body.branch_id;
  const r_timestamp = req.body.timestamp;
  var r_author = req.body.author;
  var authorArray = r_author.split("@");
  var new_reply_author = authorArray[0];
  const r_text = req.body.reply;

  reply_id = qid + "/" + new_reply_author + "/" + r_timestamp;

  reply_json = {
    qid: qid,
    reply_id: reply_id,
    reply_author: r_author,
    reply_timestamp: r_timestamp,
    reply_text: r_text,
    flagged : false,
    numFlags : 0
  };

  const key_string = reply_id;
  const reply_pair = { "replies.[reply_id]": reply_json };

  data = { $set: { ["replies." + reply_id]: reply_json } };
  //data = { $set: { timestamp: "latest" } };
  Discussion.updateOne({ _id: qid }, data, (err, result) => {
    if (err) {
      console.log("Error occurred");
      throw err;
    }
    res.status(200).json({ msg: "Reply posted successfully." });
  });
});

router.post("/delete_question", (req, res) => {
  const qid = req.body.qid;
  Discussion.deleteOne({ _id: qid }, (err, result) => {
    if (err) throw err;
    res.status(200).json({ msg: "Question deleted successfully." });
  });
});

router.post("/delete_reply", (req, res) => {
  const qid = req.body.qid;
  const replyId = req.body.replyId;

  var ques = Discussion.updateOne(
    { _id: qid },
    { $unset: { ["replies." + replyId]: "" } },
    (err, result) => {
      try {
        if (err) throw err;
      } catch {
        console.log("ERROR !!!!!\n" + err);
      }
      if (result == null) res.status(400).json({ msg: "Invalid question ID" });

      res.status(200).json({ msg: "Reply deleted  successfully." });
    }
  );
  //const obj = JSON.parse(JSON.stringify(mongoObj));
  //console.log(typeof obj);
  //console.log(obj);
});

router.get("/flaggedPosts", (req, res) => {
  Discussion.find({ flagType: { $in: [1, 2, 3] } }, (err, result) => {
    if (err) throw err;
    res.status(200).send(JSON.stringify(result));
  });
});

router.post("/flag_question", (req, res) => {
  const qid = req.body.qid;
  var flag;
  Discussion.findById(qid, (err, result) => {
    if (err) throw err;
    if(result == null) return res.status(400).json( { "msg" : "Invalid QuestionID" } );
    flag = result.flagType;
    console.log("flagType "+ flag.toString())

    var newFlag;
    if(flag == 1 || flag == 3) {
      newFlag = flag;
    //return res.status(200).json( { "msg" : "Question flagged successfully." } );
    }
    else if(flag == 0) newFlag = 1;
    else if(flag == 2) newFlag = 3;
    
    Discussion.updateOne(
      { _id: result._id },  
      { $set: { flagType : newFlag },  $inc: { numFlags: 1 }  },
      /*
      { $set: { flagType : newFlag }, 
        $inc: { numFlags: 1 },
      }, 
      */
       (err, result) => {
        try {
          if (err) throw err;
        } catch {
          console.log("ERROR !!!!!\n" + err);
        }
      return res.status(200).json( { "msg" : "Question flagged successfully." } );
    });

  });
});


router.post("/flag_reply", (req, res) => {
  const qid = req.body.qid;
  const replyId = req.body.replyId;
  
  var flag;
  Discussion.findById(qid, (err, result) => {
    if (err) throw err;
    if(result == null) return res.status(400).json( { "msg" : "Invalid QuestionID" } );
    flag = result.flagType;
    console.log("flagType "+ flag.toString())

    var newFlag;
    if(flag == 2 || flag == 3) {
      newFlag = flag;
    }
    else if(flag == 0) newFlag = 2;
    else if(flag == 1) newFlag = 3;

    Discussion.updateOne(
      { _id: qid },
      { $set: { flagType : newFlag  , ["replies." + replyId + ".flagged"]: true },  $inc: { ["replies." + replyId + ".numFlags"]: 1 }  },
      (err, result) => {
        try {
          if (err) throw err;
        } catch {
          console.log("ERROR !!!!!\n" + err);
        }
        if (result == null) return res.status(400).json({ msg: "Invalid question ID" });
  
        return res.status(200).json({ msg: "Reply flagged successfully." });
      }
    );

  });
});

module.exports = router;
