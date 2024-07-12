const express = require("express");
const router = express.Router();

const PostController = require("../controllers/posts");

router.get("/create-post", PostController.renderCreatePage);

router.post("/", PostController.createPost);

router.get("/edit/:postId", PostController.getEditPost);

router.post("/edit/", PostController.updatePost);

router.post("/delete/:postId", PostController.deletePost);

module.exports = router;
