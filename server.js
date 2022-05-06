const express = require("express");
const app = express();
const mongoose = require("mongoose");

app.use(express.json());

//Using the Middleware
app.use(cors_headers);
app.use(logger);

//Using the routes from other files
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

const discussionForumRouter = require("./routes/discussion-forum");
app.use("/discussion-forum", discussionForumRouter);

const opportunitiesRouter = require("./routes/opportunities");
app.use("/opportunities", opportunitiesRouter);

const AnnouncementsRouter = require("./routes/announcements");
app.use("/announcements", AnnouncementsRouter);

//Database Connectivity
const mongo_url = process.env.DATABASE_URL;
mongoose.connect(mongo_url);
const db = mongoose.connection;

db.on("error", (error) => {
  console.log("ERROR !!!!!\n");
  console.error(error);
});
db.once("open", () => console.log("Connected to database"));

//Routes
app.get("/", (req, res) => {
  res.status(501).send("<h1>server.js</h1>");
});

app.get("/status", (req, res) => {
  //res.status(200).send("status sent");
  res.sendStatus(200);
});

//Middleware
function logger(req, res, next) {
  console.log(req.originalUrl);
  next();
}

function cors_headers(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  // Set custom headers for CORS
  res.header(
    "Access-Control-Allow-Headers",
    "Content-type,Accept,X-Custom-Header"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return next();
}

app.listen(3000);

module.exports = db;
/*
//var bodyParser = require("body-parser");
//app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());
app.options("http://localhost:3000", cors());

app.use(
  cors({
    origin: "*",
    "Access-Control-Allow-Origin": "*",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  console.log("def route.....");
  //res.send("<h1>hello</h1>")
  //res.sendStatus(201)
  //res.json({ msg : "hello msg" })
  //res.status(500).send("Hiiiii")
  res.send("<h1>server.js</h1>");
});
*/
