const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripControllers");
const { authMiddleware, requirePermission } = require("../middleware/auth");

// All trip routes require authentication
router.use(authMiddleware);


router.get(
  "/",
  requirePermission("transportation", "viewTrips"),
  tripController.getAllTrips
);
router.post(
  "/",
  requirePermission("transportation", "createTrips"),
  tripController.createTrip
);


router.get(
  "/:id",
  requirePermission("transportation", "viewTrips"),
  tripController.getTripById
);
router.put(
  "/:id",
  requirePermission("transportation", "editTrips"),
  tripController.updateTrip
);
router.delete(
  "/:id",
  requirePermission("transportation", "deleteTrips"),
  tripController.deleteTrip
);


router.get(
  "/stats",
  requirePermission("transportation", "viewTrips"),
  tripController.getTripStats
);


router.get(
  "/recent",
  requirePermission("transportation", "viewTrips"),
  tripController.getRecentTrips
);


router.post(
  "/calculate-profit",
  requirePermission("transportation", "viewTrips"),
  tripController.calculateTripProfit
);

module.exports = router;


