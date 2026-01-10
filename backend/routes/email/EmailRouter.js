const express = require("express");
const { verifyToken } = require("../../middleware/middleware");
const { uploadPhoto } = require("../../middleware/upload");
const { sendInvoiceEmail } = require("../../service/EmailService");
const router = express.Router();

router.post("/send-invoice-customer", sendInvoiceEmail);

module.exports = router;
