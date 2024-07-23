const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");

router.get("/login", authController.getLoginPage);
router.get("/register", authController.getRegisterPage);
router.post("/register", authController.createAccount);
router.post("/login", authController.postLoginData);
router.post("/logout", authController.logout);
router.get("/reset-password", authController.renderResetPwd);
router.get("/feedback", authController.renderFeedback);
router.post("/reset", authController.resetLinkSent);
router.get("/reset-password/:token", authController.getNewPasswordPage);
router.post("/change-new-pwd", authController.setNewPassword);

module.exports = router;
