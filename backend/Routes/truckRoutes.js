const express = require("express");
const router = express.Router();
const truckController = require("../controllers/truckControllers");
const { authMiddleware, requirePermission } = require("../middleware/auth");

router.use(authMiddleware);

router.get(
  "/",
  requirePermission("inventory", "viewInventory"),
  truckController.getAllTrucks
);
router.post(
  "/",
  requirePermission("inventory", "addTrucks"),
  truckController.createTruck
);

router.get(
  "/:id",
  requirePermission("inventory", "viewInventory"),
  truckController.getTruckById
);
router.put(
  "/:id",
  requirePermission("inventory", "editTrucks"),
  truckController.updateTruck
);
router.delete(
  "/:id",
  requirePermission("inventory", "deleteTrucks"),
  truckController.deleteTruck
);

router.get(
  "/stats",
  requirePermission("inventory", "viewInventory"),
  truckController.getTruckStats
);

router.get(
  "/fleet-status",
  requirePermission("inventory", "viewInventory"),
  truckController.getFleetStatus
);

router.get(
  "/available",
  requirePermission("inventory", "viewInventory"),
  truckController.getAvailableTrucks
);

router.put(
  "/:id/status",
  requirePermission("inventory", "editTrucks"),
  truckController.updateTruckStatus
);

router.post(
  "/calculate-profit",
  requirePermission("inventory", "viewInventory"),
  truckController.calculateTruckProfit
);

module.exports = router;



