const express = require("express");
const router = express.Router();
const { getDashboardAdmin } = require("../../controllers/admin/DashboardController");

// GET /admin/dashboard
router.get("/dashboard", getDashboardAdmin);

module.exports = router;

