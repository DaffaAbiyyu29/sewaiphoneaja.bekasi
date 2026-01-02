const express = require("express");
const router = express.Router();
const RentalController = require("../../controllers/rental/RentalController");
const {
  createRent,
  getRents,
  getRentById,
  getRentByInvoiceOrNik,
  deleteRent,
  updateRent,
  approveRent,
  rejectRent,
  collectUnit,
  returnUnit,
} = require("../../controllers/rental/RentalController");
const { verifyToken } = require("../../middleware/middleware");
const { resError, resSuccess } = require("../../helpers/sendResponse");

router.get("/pesanan", (req, res) => {
  return resSuccess(res, "Data rental berhasil diambil", {});
});

router.get("/pesanan/:search", getRentByInvoiceOrNik);

router.post("/", createRent);
router.get("/", verifyToken, getRents);
router.get("/:rentId", verifyToken, getRentById);
router.put("/:rentId", verifyToken, updateRent);
router.put("/:rentId/approve", verifyToken, approveRent);
router.put("/:rentId/reject", verifyToken, rejectRent);
router.put("/:rentId/collect", verifyToken, collectUnit);
router.put("/:rentId/return", verifyToken, returnUnit);
router.delete("/:rentId", verifyToken, deleteRent);

module.exports = router;
