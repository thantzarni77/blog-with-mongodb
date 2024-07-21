const express = require("express");
const router = express.Router();

const PostController = require("../controllers/post");

router.get("/", PostController.renderHomePage);

router.get("/post/:postId", PostController.getDetails);
module.exports = router;
