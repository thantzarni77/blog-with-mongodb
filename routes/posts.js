const express = require("express");
const router = express.Router();

const PostController = require("../controllers/post");
const UserController = require("../controllers/user");

router.get("/", PostController.renderHomePage);

router.get("/post/:postId", PostController.getDetails);

router.get("/profile/:userId", UserController.getPublicProfilePage);

module.exports = router;
