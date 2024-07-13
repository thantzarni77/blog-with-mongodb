const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const postRoutes = require("./routes/posts");
const adminRoutes = require("./routes/admin");
const dotenv = require("dotenv").config();

const app = express();

const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log("Parent Middleware");
  next();
});

app.use("/admin", (req, res, next) => {
  console.log("Admin Middleware");
  next();
});

app.use(postRoutes);
app.use("/admin", adminRoutes);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(8000);
    console.log("connected to mongodb");
  })
  .catch((err) => console.log(err));
