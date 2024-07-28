const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const PostController = require("../controllers/post");

router.get("/create-post", PostController.renderCreatePage);

router.post(
  "/",
  body("title")
    .isLength({ min: 5 })
    .withMessage("Title must have at least 5 letters"),
  body("photo").isURL().withMessage("Image must be a valid url"),
  body("description")
    .isLength({ min: 30 })
    .withMessage("Description must have at least 30 letters"),
  PostController.createPost
);

router.get("/edit/:postId", PostController.getEditPost);

router.post(
  "/edit/",
  body("title")
    .isLength({ min: 5 })
    .withMessage("Title must have at least 5 letters"),
  body("photo").isURL().withMessage("Image must be a valid url"),
  body("description")
    .isLength({ min: 30 })
    .withMessage("Description must have at least 30 letters"),
  PostController.updatePost
);

router.post("/delete/:postId", PostController.deletePost);

module.exports = router;
