const express = require("express");
const { verifyToken } = require("../../middleware/middleware");
const { uploadPhoto } = require("../../middleware/upload");
const { exportInvoicePdfByNumber } = require("../../service/pdfService");
const router = express.Router();

router.get("/invoice/pdf/:invoice_number", exportInvoicePdfByNumber);

module.exports = router;
