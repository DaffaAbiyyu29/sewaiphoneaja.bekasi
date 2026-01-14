const express = require("express");
const {
  sendInvoiceEmail,
  sendRejectedInvoiceEmail,
} = require("../../service/EmailService");
const router = express.Router();

router.post("/send-invoice-customer", sendInvoiceEmail);
router.post("/send-rejected-invoice-customer", sendRejectedInvoiceEmail);

module.exports = router;
