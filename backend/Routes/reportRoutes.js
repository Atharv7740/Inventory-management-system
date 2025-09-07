const express = require("express");
const router = express.Router();
const { authMiddleware, requirePermission } = require("../middleware/auth");
const reports = require("../controllers/reportsController");

router.use(authMiddleware);

router.get(
  "/overview",
  requirePermission("reports", "viewReports"),
  reports.getOverview
);
router.get(
  "/transport",
  requirePermission("reports", "viewReports"),
  reports.getTransportReport
);
router.get(
  "/inventory",
  requirePermission("reports", "viewReports"),
  reports.getInventoryReport
);

module.exports = router;
