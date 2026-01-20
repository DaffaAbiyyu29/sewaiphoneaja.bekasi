const express = require("express");
const router = express.Router();
const {
  getRevenueReport,
  getRentalReport,
  getCustomerReport,
  getUnitReport,
  getReport,
} = require("../../controllers/admin/ReportController");
const { exportReport } = require("../../service/pdfService");
const { verifyToken } = require("../../middleware/middleware");

// Unified endpoint GET /admin/reports?type={revenue|rental|customer|unit}
router.get("/", getReport);

// Export report to PDF: GET /admin/reports/export?type={revenue|rental|customer|unit}&startDate=...&endDate=...
router.get("/export", verifyToken, exportReport);

module.exports = router;
