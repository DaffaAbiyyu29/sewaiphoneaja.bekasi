const express = require("express");
const {
  getAllUnit,
  getUnitByCode,
  getVariantUnitByUnitCode,
  getPriceUnitByUnitCode,
  createUnit,
  updateUnit,
  deleteUnit,
} = require("../../controllers/admin/UnitController");
const { verifyToken } = require("../../middleware/middleware");
const { uploadPhoto } = require("../../middleware/upload");
const router = express.Router();

// =======================
// ✅ ROUTE GET (sudah ada)
// =======================
router.get("/", verifyToken, getAllUnit); // GET all units
router.get("/:unitCode", verifyToken, getUnitByCode); // GET unit by code
router.get("/variant/:unitCode", verifyToken, getVariantUnitByUnitCode); // GET variant by unit code
router.get("/price/:unitCode", verifyToken, getPriceUnitByUnitCode); // GET price by unit code

// =======================
// ✅ ROUTE CREATE / UPDATE / DELETE
// =======================

// CREATE Unit
router.post("/", verifyToken, uploadPhoto, createUnit);

// UPDATE Unit
router.put("/:unitCode", verifyToken, uploadPhoto, updateUnit);

// DELETE Unit
router.delete("/:unitCode", verifyToken, deleteUnit);

module.exports = router;
