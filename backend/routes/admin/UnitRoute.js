const express = require("express");
const {
  getAllUnit,
  getUnitByCode,
  getVariantUnitByUnitCode,
  getPriceUnitByUnitCode,
} = require("../../controllers/admin/UnitController");
const { verifyToken } = require("../../middleware/middleware");
const router = express.Router();

router.get("/", verifyToken, getAllUnit); // GET all units
router.get("/:unitCode", verifyToken, getUnitByCode); // GET unit by code
router.get("/variant/:unitCode", verifyToken, getVariantUnitByUnitCode); // GET unit by code
router.get("/price/:unitCode", verifyToken, getPriceUnitByUnitCode); // GET unit by code

module.exports = router;
