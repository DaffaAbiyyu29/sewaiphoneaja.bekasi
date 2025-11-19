const express = require("express");
const { verifyToken } = require("../../middleware/middleware");
const {
  createPriceUnit,
  updatePriceUnit,
  deletePriceUnit,
} = require("../../controllers/admin/PriceUnitController");
const router = express.Router();

// =======================
// ✅ ROUTE CREATE / UPDATE / DELETE
// =======================

// CREATE Price Unit
router.post("/", verifyToken, createPriceUnit);

// UPDATE Unit
router.put("/:priceId", verifyToken, updatePriceUnit);

// DELETE Unit
router.delete("/:priceId", verifyToken, deletePriceUnit);

module.exports = router;
