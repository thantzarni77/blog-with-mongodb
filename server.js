const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);

const postRoutes = require("./routes/posts");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

const app = express();

const User = require("./models/user");

const store = new mongoStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

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
app.use(authRoutes);

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
