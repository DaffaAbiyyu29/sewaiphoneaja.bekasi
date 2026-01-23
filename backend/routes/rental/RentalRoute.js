const express = require("express");
const router = express.Router();
const {
  createRent,
  getRents,
  getRentById,
  getRentByInvoiceOrNik,
  getActiveRentByCustomerAndDate,
  getRentsByDateRange,
  getNextInvoice,
  reStockForRent,
  reStockForRentOnce,
  deleteRent,
  updateRent,
  cancelRent,
  collectUnit,
  returnUnit,
  createRentWithDetail,
} = require("../../controllers/rental/RentalController");
const { verifyToken } = require("../../middleware/middleware");
const { resSuccess } = require("../../helpers/sendResponse");

router.post("/getInvoice", getNextInvoice);
router.get("/pesanan", (req, res) => {
  return resSuccess(res, "Data rental berhasil diambil", {});
});

router.get("/pesanan/:search", getRentByInvoiceOrNik);

router.get("/checkAvailableUnit", verifyToken, getRentsByDateRange);



router.get(
  "/active-by-customer/:customerId",
  verifyToken,
  getActiveRentByCustomerAndDate,
);

router.post("/", createRentWithDetail);
router.get("/", verifyToken, getRents);
router.get("/:rentId", verifyToken, getRentById);
router.put("/:rentId", verifyToken, updateRent);
router.put("/:rentId/collect", verifyToken, collectUnit);
router.put("/:rentId/return", verifyToken, returnUnit);
router.put("/:rentId/cancel", verifyToken, cancelRent);
router.put("/:rentId/reStockForRent", verifyToken, reStockForRent);
router.put("/:rentId/reStockForRentOnce", verifyToken, reStockForRentOnce);
router.delete("/:rentId", verifyToken, deleteRent);

module.exports = router;
