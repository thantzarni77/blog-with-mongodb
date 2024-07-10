const express = require("express");
const router = express.Router();

const PostController = require("../controllers/posts")

router.get("/create-post", PostController.renderCreatePage)

router.post("/", PostController.createPost)

module.exports = router;