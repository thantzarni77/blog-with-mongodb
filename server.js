const express = require("express");
const path = require("path");

const postRoutes = require("./routes/posts");
const adminRoutes = require("./routes/admin");

const { mongodbConnector } = require("./utils/database");

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

mongodbConnector();
app.listen(8000);
