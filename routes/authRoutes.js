const express = require("express");
const router = express.Router();

const {signupController,loginController,verifyOtpController} = require("../controllers/authController");

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/verify-otp", verifyOtpController);

module.exports = router;