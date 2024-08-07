const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const PostController = require("../controllers/post");
const UserController = require("../controllers/user");

router.get("/create-post", PostController.renderCreatePage);

router.post(
  "/",
  body("title")
    .isLength({ min: 5 })
    .withMessage("Title must have at least 5 letters"),
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
  body("description")
    .isLength({ min: 30 })
    .withMessage("Description must have at least 30 letters"),
  PostController.updatePost
);

router.post("/delete/:postId", PostController.deletePost);

router.get("/profile", UserController.getProfilePage);

router.get("/username", UserController.renderUserNamePage);

router.post(
  "/setUserName",
  body("username")
    .isLength({ min: 4 })
    .withMessage("Username must have at least 4 letters"),
  UserController.setUserName
);

router.get("/premium", UserController.renderPremiumPage);

router.get("/subscription_success", UserController.getSuccessPage);
module.exports = router;
