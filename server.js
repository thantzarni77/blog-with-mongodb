const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const postRoutes = require("./routes/posts");
const adminRoutes = require("./routes/admin");
const dotenv = require("dotenv").config();

const app = express();

const bodyParser = require("body-parser");

const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  User.findById("6694199b6b37b3af19ce3b32").then((user) => {
    req.user = user;
    next();
  });
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
    return User.findOne().then((user) => {
      if (!user) {
        User.create({
          username: "testuser",
          email: "testuser@gmail.com",
          password: "testuser",
        });
      }
      return user;
    });
  })
  .then((result) => console.log(result))
  .catch((err) => console.log(err));
