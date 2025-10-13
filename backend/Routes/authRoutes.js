const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware, loginRateLimit } = require("../middleware/auth");

router.post("/login", loginRateLimit, authController.login);
router.post("/forgot-password", authController.forgotPassword);
// Backwards-compatibility: user clicks email that points to backend - redirect to frontend reset page
router.get("/reset-password/:token", authController.redirectResetToFrontend);

// Endpoint to submit new password. Accepts token in body or in URL param.
router.post("/reset-password/:token?", authController.resetPassword);
// API endpoint to validate the token (used by frontend to show reset page)
router.get(
  "/reset-password/:token/validate",
  authController.validateResetToken
);
// Dev helper: fetch latest reset token for an email (only outside production)
router.get("/dev/reset-token", authController.getResetTokenForEmail);
// Dev helper: check email transporter (non-production only)
router.get("/dev/transporter-status", authController.getEmailTransporterStatus);
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
