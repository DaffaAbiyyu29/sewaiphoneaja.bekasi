const express = require("express");
const {
  getAllUnitCatalog,
  getCatalogByUnitCode,
} = require("../../controllers/customer/UnitController");
const router = express.Router();

// ==
// ✅ ROUTE GET (sudah ada)
// ==
router.get("/", getAllUnitCatalog);
router.get("/:unitCode", getCatalogByUnitCode);

module.exports = router;
