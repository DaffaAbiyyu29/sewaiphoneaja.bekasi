const express = require("express");
const router = express.Router();
const PaymentController = require("../../controllers/payment/PaymentController");

// create
router.post("/", PaymentController.createPayment);
// list
router.get("/", PaymentController.getPayments);
// detail
router.get("/:paymentId", PaymentController.getPaymentById);
// update
router.put("/:paymentId", PaymentController.updatePayment);
// delete
router.delete("/:paymentId", PaymentController.deletePayment);

module.exports = router;
