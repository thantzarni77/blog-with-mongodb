const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");

router.get("/login", authController.getLoginPage);
router.get("/register", authController.getRegisterPage);
router.post("/register", authController.createAccount);
router.post("/login", authController.postLoginData);
router.post("/logout", authController.logout);

module.exports = router;
