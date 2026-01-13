const express = require("express");
const router = express.Router();
const {
  createPayment,
  getPayments,
  getPaymentById,
  deletePayment,
  updatePayment,
} = require("../../controllers/payment/PaymentController");
const { verifyToken } = require("../../middleware/middleware");
const { uploadPhoto } = require("../../middleware/upload");

// create
router.post("/", uploadPhoto, createPayment);
// update
router.put("/:paymentId", uploadPhoto, updatePayment);
// list
router.get("/", verifyToken, getPayments);
// detail
router.get("/:paymentId", verifyToken, getPaymentById);
// delete
router.post("/delete/:paymentId", verifyToken, deletePayment);

module.exports = router;
