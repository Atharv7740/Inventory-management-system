const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware, loginRateLimit } = require("../middleware/auth");


router.post("/login", loginRateLimit, authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
