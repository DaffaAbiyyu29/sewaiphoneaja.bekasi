const express = require("express");
const router = express.Router();
const RentalController = require("../../controllers/rental/RentalController");
const {
  createRent,
  getRents,
  getRentById,
  getRentByInvoiceOrNik,
  getActiveRentByCustomerAndDate,
  getRentsByDateRange,
  deleteRent,
  updateRent,
  cancelRent,
  collectUnit,
  returnUnit,
} = require("../../controllers/rental/RentalController");
const { verifyToken } = require("../../middleware/middleware");
const { resError, resSuccess } = require("../../helpers/sendResponse");

router.get("/pesanan", (req, res) => {
  return resSuccess(res, "Data rental berhasil diambil", {});
});

router.get("/pesanan/:search", getRentByInvoiceOrNik);

router.get("/checkAvailableUnit", verifyToken, getRentsByDateRange);

router.get(
  "/active-by-customer/:customerId",
  verifyToken,
  getActiveRentByCustomerAndDate
);


router.post("/", createRent);
router.get("/", verifyToken, getRents);
router.get("/:rentId", verifyToken, getRentById);
router.put("/:rentId", verifyToken, updateRent);
router.put("/:rentId/collect", verifyToken, collectUnit);
router.put("/:rentId/return", verifyToken, returnUnit);
router.put("/:rentId/cancel", verifyToken, cancelRent);
router.delete("/:rentId", verifyToken, deleteRent);


module.exports = router;
