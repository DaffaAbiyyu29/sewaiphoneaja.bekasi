const express = require("express");
const { verifyToken } = require("../../middleware/middleware");
const { uploadPhoto } = require("../../middleware/upload");
const {
  sendInvoiceEmail,
  sendRejectedInvoiceEmail,
  exportInvoicePdf,
} = require("../../service/EmailService");
const router = express.Router();

router.post("/send-invoice-customer", sendInvoiceEmail);
router.post("/send-rejected-invoice-customer", sendRejectedInvoiceEmail);

module.exports = router;
