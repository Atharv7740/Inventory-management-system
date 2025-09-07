const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authMiddleware, requirePermission } = require("../middleware/auth");

// All dashboard routes require authentication
router.use(authMiddleware);

router.get("/overview", dashboardController.getDashboardOverview);

router.get(
  "/recent-trips",
  requirePermission("transportation", "viewTrips"),
  dashboardController.getRecentTrips
);

router.get(
  "/fleet-status",
  requirePermission("inventory", "viewInventory"),
  dashboardController.getFleetStatus
);

router.get(
  "/trips",
  requirePermission("transportation", "viewTrips"),
  dashboardController.getAllTrips
);
router.post(
  "/trips",
  requirePermission("transportation", "createTrips"),
  dashboardController.createTrip
);

router.get(
  "/trucks",
  requirePermission("inventory", "viewInventory"),
  dashboardController.getAllTrucks
);
router.post(
  "/trucks",
  requirePermission("inventory", "addTrucks"),
  dashboardController.createTruck
);

module.exports = router;
