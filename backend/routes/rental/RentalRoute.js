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
} = require("../../controllers/rental/RentalController");
const { verifyToken } = require("../../middleware/middleware");
const { resError, resSuccess } = require("../../helpers/sendResponse");

router.post("/", RentalController.createRent);
router.get("/", RentalController.getRents);
router.get("/:rentId", RentalController.getRentById);
router.put("/:rentId", RentalController.updateRent);
router.put("/:rentId/approve", RentalController.approveRent);
router.put("/:rentId/reject", RentalController.rejectRent);
router.put("/:rentId/return", RentalController.returnUnit);
router.delete("/:rentId", RentalController.deleteRent);

router.get("/pesanan", (req, res) => {
  return resSuccess(res, "Data rental berhasil diambil", {});
});

router.get("/pesanan/:search", getRentByInvoiceOrNik);

router.post("/", verifyToken, createRent);
router.get("/", verifyToken, getRents);
router.get("/:rentId", verifyToken, getRentById);
router.put("/:rentId", verifyToken, updateRent);
router.put("/:rentId/approve", verifyToken, approveRent);
router.put("/:rentId/reject", verifyToken, rejectRent);
router.delete("/:rentId", verifyToken, deleteRent);

module.exports = router;
