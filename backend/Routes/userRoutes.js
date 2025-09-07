const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authMiddleware,
  adminOnly,
  requirePermission,
} = require("../middleware/auth");

// All user management routes require authentication
router.use(authMiddleware);
router.get("/", adminOnly, userController.getAllUsers);
router.post("/", adminOnly, userController.createUser);
router.get("/:id", adminOnly, userController.getUserById);
router.put("/:id", adminOnly, userController.updateUser);
router.delete("/:id", adminOnly, userController.deleteUser);
router.put("/:id/reset-password", adminOnly, userController.resetUserPassword);
router.put("/:id/toggle-status", adminOnly, userController.toggleUserStatus);

module.exports = router;
