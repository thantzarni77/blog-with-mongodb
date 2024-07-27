const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../models/user");

const authController = require("../controllers/auth");

//render Login Page
router.get("/login", authController.getLoginPage);

//render register Page
router.get("/register", authController.getRegisterPage);

//handel register
router.post(
  "/register",
  body("email")
    .isEmail()
    .withMessage("Please Enter a valid email address")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("Email Already Exists. Please try another one");
        }
      });
    }),
  body("password")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password must have at least 4 letters"),
  authController.createAccount
);

//handle login
router.post(
  "/login",
  body("email").isEmail().withMessage("Please Enter a valid email address"),
  body("password")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password must valid"),
  authController.postLoginData
);

//handle logout
router.post("/logout", authController.logout);

//render password reset page
router.get("/reset-password", authController.renderResetPwd);

//render feedback page
router.get("/feedback", authController.renderFeedback);

//handle password reset link sent
router.post(
  "/reset",
  body("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (!user) {
          return Promise.reject("No account found with this email.");
        }
      });
    }),
  authController.resetLinkSent
);

//render new password page
router.get("/reset-password/:token", authController.getNewPasswordPage);

//handle password change
router.post(
  "/change-new-pwd",
  body("password")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password must have at least 4 letters"),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password must match !!");
      }
      return true;
    }),
  authController.setNewPassword
);

module.exports = router;
