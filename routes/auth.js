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
const { request } = require("express");
//const res = require("express/lib/response");
//const { send } = require("express/lib/response");

var users = [];
var refreshTokens = [];

router.post("/generateNewAccessToken", (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken == null)
    return res.status(401).json({ msg: "Refresh token is NULL" });

  jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN, (err, user) => {
    if (err) throw err; //return res.status(403).json({ msg: "Error" });
    console.log(user);
    //res.status(200).json(user);
    try {
      User.findOne({ email: user.email }, async function (err, result) {
        try {
          if (err) throw err;
        } catch {
          console.log("ERROR !!!!!\n" + err);
        }
        const query_result = JSON.stringify(result);
        console.log("query result : \n");
        console.log(query_result);
        console.log(typeof result.refToken);
        console.log(typeof refreshToken);
        console.log(result.refToken);
        console.log(refreshToken);
        if (query_result == null)
          return res.status(401).json({ msg: "Invalid User" });

        if (result.refToken != refreshToken)
          return res
            .status(401)
            .json({ msg: "Refresh token is INVALID/EXPIRED" });
        else {
          jwt.verify(
            refreshToken,
            process.env.SECRET_REFRESH_TOKEN,
            (err, user) => {
              if (err)
                return res
                  .status(403)
                  .json({ msg: "Error validating refresh token" });

              const accessToken = generateAccessToken({ email: user.email });
              res.status(201).json({ accessToken: accessToken });
            }
          );
        }
      });
    } catch {
      return res.status(400).send("errorr");
    }
    //next();
  });
});

/*
router.post("/generateNewTokenOLD", (req, res) => {
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
*/

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
        //const accessToken = generateAccessToken(user);
        const accessToken = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, {
          expiresIn: "24h",
        });
        const refreshToken = jwt.sign(user, process.env.SECRET_REFRESH_TOKEN);
        //refreshTokens.push(refreshToken);
        const reftoken = refreshToken.substring(7, refreshToken.length);
        console.log("typeof refreshToken : ");
        console.log(typeof refreshToken);
        console.log(refreshToken);
        addRefTokenToDb(refreshToken, email);

        res.cookie("token", accessToken, { httpOnly: true }).json({
          accessToken: accessToken,
          refreshToken: refreshToken,
          msg: "Login Successful",
          userType: result.userType,
          email: result.email,
          validGroups: result.validGroups,
        });
      } else {
        res.status(400).json({ msg: "Incorrect Credentials" });
      }
    });
  } catch {
    res.status(500).json({ msg: "Error logging in" });
  }
});

router.post("/logout", (req, res) => {
  const uid = request.body.userId;
  User.updateOne({ _id: uid }, { $unset: { reftoken: "" } }, (err, result) => {
    if (err) {
      console.log("ERROR !!!!!");
      throw err;
    }
    res.status(200).json({ msg: "Logged Out" });
  });
});
/*
      res.status(201).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        msg: "Login Successful",
      });
    */

router.post("/register", async (req, res) => {
  try {
    var email = req.body.email;
    var pwd = req.body.pwd;
    //var refToken = req.body.refToken;
    //var lastLogin = req.body.lastLogin;
    var validGroups = req.body.validGroups;
    var userType = req.body.userType;

    //password hashing
    const salt = await bcrypt.genSalt();
    const hashedPwd = await bcrypt.hash(pwd, salt);

    console.log("Email : " + email + "\nPassw : " + pwd);
    console.log("\nHashed pwd : " + hashedPwd);

    User.create(
      {
        email: email,
        pwd: hashedPwd,
        refToken: "None",
        //lastLogin: lastLogin,
        validGroups: validGroups,
        userType: userType,
      },
      function (err, result) {
        if (err) {
          console.log("ERROR !!!!!");
          throw err;
        }
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
  return jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, { expiresIn: "24h" });
}

function getCurrentDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = dd + "-" + mm + "-" + yyyy;

  return today;
}

function addRefTokenToDb(refreshToken, user_email) {
  User.updateOne(
    { email: user_email },
    { refToken: refreshToken },
    (err, res) => {
      try {
        if (err) throw err;
      } catch {
        console.log("ERROR adding refToken to Database" + err);
      }
    }
  );
}

function addRefToken(refToken, today) {
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
    if (err) {
      throw err;
      return res.status(403).json({ msg: "Access Token Invalid/Expired" });
    }
    console.log(user);
    req.user = user;
    next();
  });
}

module.exports = router;

/*
router.post("/logout", (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken == null)
    return res.status(401).json({ msg: "Refresh token is NULL" });

  jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN, (err, user) => {
    if (err) throw err; //return res.status(403).json({ msg: "Error" });
    console.log(user);
    //res.status(200).json(user);
    try {
      User.findOne({ email: user.email }, async function (err, result) {
        try {
          if (err) throw err;
        } catch {
          console.log("ERROR !!!!!\n" + err);
        }
      });
    } catch {}
  });
});


router.post("/logout", (req, res) => {
  console.log(req.user);
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.status(202).json({ msg: "Refresh token deleted successfully" });
});
*/
