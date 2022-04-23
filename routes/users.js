const express = require("express");
const router = express.Router();

const User = require("../models/registeredUsers");
const db = require("../server");
const mongoose = require("mongoose");

router.get("/default", (req, res) => {
  console.log("deffff");
  res.send("<h2>Routes.js</h2>");
});

/*
router.get("/:id", (req, res) => {
  res.send("<h2>Routes - " + req.params.id + "</h2>");
});
*/

router.get("/db", (req, res) => {
  User.find({}, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.send(JSON.stringify(result));
    //db.close();
    // mongoose.connection.close();
  });
});

router.get("/db/:id", (req, res) => {
  //res.send("Hello");
  let uid = req.params.id;
  User.findById(uid, function (err, result) {
    try {
      if (err) throw err;
    } catch {
      console.log("ERROR !!!!!\n" + err);
    }
    //console.log(result);
    res.send(JSON.stringify(result));
    //db.close();
    //mongoose.connection.close();
  });
});
module.exports = router;
