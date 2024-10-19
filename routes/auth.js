const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/register", authController.register);
router.post("/verify-otp-and-save", authController.verifyOTPAndSave);
router.post("/logout", authController.logout);

router.get("/profile", authController.verifyToken, (req, res) => {
  res.status(200).json({ message: "Profile data" });
});
router.post("/send-login-otp", authController.sendLoginOtp);

router.post("/verify-login-otp", authController.verifyLoginOtp);



module.exports = router;
