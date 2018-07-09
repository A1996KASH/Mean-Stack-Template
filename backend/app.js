const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require('path');
const postRoutes = require("./routes/posts");
const app = express();
mongoose
  .connect("mongodb://localhost:27017/meanApp")
  .then(() => {
    console.log("connected");
  })
  .catch(() => {
    console.log("Connection failed");
  });

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-with,Content-Type,Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts",postRoutes);

module.exports = app;
