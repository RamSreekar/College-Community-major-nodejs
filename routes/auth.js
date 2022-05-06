require("dotenv").config();

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { route } = require("./users");
const cookieParser = require("cookie-parser");

router.use(cookieParser());

const db = require("../server");
const mongoose = require("mongoose");
const User = require("../models/registeredUsers");
const RefTokens = require("../models/refreshTokens");
const { query } = require("express");
//const res = require("express/lib/response");
//const { send } = require("express/lib/response");

var users = [];
var refreshTokens = [];

router.post("/generateNewToken", (req, res) => {
  const refreshToken = req.body.refToken;
  if (refreshToken == null)
    return res.status(401).json({ msg: "Refresh token is NULL" });

  if (!refreshTokens.includes(refreshToken))
    return res.status(401).json({ msg: "Refresh token INVALID/EXPIRED" });

  jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN, (err, user) => {
    if (err)
      return res.status(403).json({ msg: "Error validating refresh token" });

    const accessToken = generateAccessToken({ email: user.email });
    res.status(201).json({ accessToken: accessToken });
  });
});

router.post("/login", async (req, res) => {
  const pwd = req.body.pwd;
  const email = req.body.email;

  if (req.body == null) {
    return res.status(201).json({ msg: "User not found / null" });
  }
  let query_res;
  try {
    User.findOne({ email: email }, async function (err, result) {
      try {
        if (err) throw err;
      } catch {
        console.log("ERROR !!!!!\n" + err);
      }
      query_result = JSON.stringify(result);
      if (query_result == null)
        return res.status(401).json({ msg: "Invalid User" });
      //console.log(JSON.stringify(result));
      console.log("query_res : \n");
      query_res = result;
      console.log(query_res);
      //console.log("Email : " + query_res.email + "\npwd : " + query_res.pwd);

      //console.log("Query_res : \n");
      //console.log(query_res);

      const userPass = query_res.pwd;
      if (await bcrypt.compare(pwd, userPass)) {
        const email = req.body.email;
        const user = { email: email };
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.SECRET_REFRESH_TOKEN);
        //refreshTokens.push(refreshToken);
        addRefTokenToDb(refreshToken, getCurrentDate());

        res.cookie("token", accessToken, { httpOnly: true }).json({
          accessToken: accessToken,
          refreshToken: refreshToken,
          msg: "Login Successful",
        });
      } else {
        res.status(400).json({ msg: "Incorrect Credentials" });
      }
    });
  } catch {
    res.status(500).json({ msg: "Error logging in" });
  }
});

/*
      res.status(201).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        msg: "Login Successful",
      });
    */

router.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.status(202).json({ msg: "Refresh token deleted successfully" });
});

router.post("/register", async (req, res) => {
  try {
    var email = req.body.email;
    var pwd = req.body.pwd;
    var refToken = req.body.refToken;
    var lastLogin = req.body.lastLogin;

    //password hashing
    const salt = await bcrypt.genSalt();
    const hashedPwd = await bcrypt.hash(pwd, salt);

    console.log("Email : " + email + "\nPassw : " + pwd);
    console.log("\nHashed pwd : " + hashedPwd);

    User.create(
      {
        email: email,
        pwd: hashedPwd,
        refToken: refToken,
        lastLogin: lastLogin,
      },
      function (err, result) {
        if (err) throw err;
        console.log("Inserted : " + result);
        //res.send(JSON.stringify(result));
        res.status(201).send({ email: email, pwd: pwd });
        //res.status(201).send("Email : " + email + "\nPassw : " + pwd);
      }
    );

    //users.push({ email: email, pwd: hashedPwd, actualPwd: pwd });
  } catch {
    res.status(500).send({ msg: "Error occured trying to register" });
  }
});

router.get("/getUsers", (req, res) => {
  /* res
    .status(201)
    .send(
      "Email : " +
        users[0].email +
        "\nPassw : " +
        users[0].pwd +
        "\nHashed pwd : " +
        users[0].actualPwd
    );
  */
  User.find({}, function (err, result) {
    try {
      if (err) throw err;
    } catch {
      console.log("ERROR !!!!!\n" + err);
    }
    res.send(JSON.stringify(result));
  });
});

router.post("/addRefToken", (req, res) => {
  const token = req.body.token;
  addRefTokenToDb(token, getCurrentDate());
  res.status(201).json({ msg: "Done" });
});

router.get("/getRefTokens", (req, res) => {
  RefTokens.find({}, function (err, result) {
    try {
      if (err) throw err;
    } catch {
      console.log("ERROR !!!!!\n" + err);
    }
    res.send(JSON.stringify(result));
  });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, { expiresIn: "30s" });
}

function getCurrentDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = dd + "-" + mm + "-" + yyyy;

  return today;
}

function addRefTokenToDb(refToken, today) {
  RefTokens.updateOne(
    { date: today },
    { $push: { tokens: refToken } },
    {
      upsert: true,
    },
    function (err, result) {
      try {
        if (err) throw err;
      } catch {
        console.log("ERROR !!!!!\n" + err);
      }
    }
  );
}

//Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  //const token = req.body.token;
  console.log("authHeader : " + authHeader);
  console.log("\nToken : " + token);
  if (token == null) return res.status(401).json({ msg: "Token is NULL" });

  jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, user) => {
    if (err) return res.status(403).json({ msg: "Token Invalid/Expired" });
    console.log(user);
    req.user = user;
    next();
  });
}

module.exports = router;
