const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");
const {
  getVariantUnitByUnitCode,
  createVariantUnit,
  deleteVariantUnit,
  updateVariantUnit,
} = require("../../controllers/admin/VariantUnitController");
const { uploadPhoto } = require("../../middleware/upload");
const { verifyToken } = require("../../middleware/middleware");

router.get("/:variantUnitCode", verifyToken, getVariantUnitByUnitCode); // GET variant by unit code

// CREATE Variant Unit
router.post("/", verifyToken, uploadPhoto, createVariantUnit);

// UPDATE Variant Unit
router.put("/:variantUnitCode", verifyToken, uploadPhoto, updateVariantUnit);

// DELETE Variant Unit
router.delete("/:variantUnitCode", verifyToken, deleteVariantUnit);

module.exports = router;
