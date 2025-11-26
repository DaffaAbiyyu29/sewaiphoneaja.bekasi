const MstPriceUnit = require("../models/MstPriceUnit");
const MstUnit = require("../models/MstUnit");
const MstVariantUnit = require("../models/MstVariantUnit");
const MstCustomer = require("../models/MstCustomer");
const MstUser = require("../models/MstUser");

// ===============================
// 🔧 GENERATOR GLOBAL UNTUK SEMUA PREFIX
// ===============================
const generateIncrementId = async (model, field, prefix) => {
  const lastData = await model.findOne({
    order: [[field, "DESC"]],
  });

  let nextNumber = 1;

  if (lastData && lastData[field]) {
    const match = lastData[field].match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1]) + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
};

// ===============================
// 🔧 GENERATOR SESUAI MODEL YANG SUDAH ADA
// ===============================

// UNIT → UNT0001
const generateUnitCode = async () => {
  return generateIncrementId(MstUnit, "unit_code", "UNT");
};

// VARIANT UNIT → VNT0001
const generateVariantUnitCode = async () => {
  return generateIncrementId(MstVariantUnit, "variant_unit_code", "VNT");
};

// PRICE UNIT → PNT0001
const generatePriceUnitCode = async () => {
  return generateIncrementId(MstPriceUnit, "price_id", "PNT");
};

// CUSTOMER → CUST0001
const generateCustomerID = async () => {
  return generateIncrementId(MstCustomer, "customer_id", "CUST");
};

// GENERATE USER → USR0001
const generateUserID = async () => {
  return generateIncrementId(MstUser, "user_id", "USR");
};

// ===============================
// 🔧 GENERATOR BARU (DARI PERMINTAAN KAMU SEBELUMNYA)
// ===============================

// RENTAL → RENT0001
const generateRentID = async (model) => {
  return generateIncrementId(model, "rent_id", "RENT");
};

// DETAIL RENTAL → DETL0001
const generateDetailRentID = async (model) => {
  return generateIncrementId(model, "detail_id", "DETL");
};

// PAYMENT → PAY0001
const generatePaymentID = async (model) => {
  return generateIncrementId(model, "payment_id", "PAY");
};

// ===============================
// Generate invoice number per-day: INV#YYMMDD0001
// ===============================
const sequelize = require("../models/index");

const generateInvoiceNumber = async (tableName = "trn_payment") => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePart = `${yy}${mm}${dd}`;

  try {
    // Count rows created today in trn_payment (uses DB server date)
    // Keep tableName limited to alphanumeric and underscore to avoid injection
    const safeTable = String(tableName).replace(/[^a-zA-Z0-9_]/g, "");
    const [results] = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM ${safeTable} WHERE DATE(created_at) = CURDATE()`
    );

    let cnt = 0;
    if (results && results[0] && (results[0].cnt !== undefined)) {
      // some mysql libs return string counts
      cnt = Number(results[0].cnt) || 0;
    }

    const next = cnt + 1;
    return `INV#${datePart}${String(next).padStart(4, "0")}`;
  } catch (err) {
    // If table/column doesn't exist or query fails, fallback to timestamp-derived suffix
    const fallbackNum = String(Date.now()).slice(-4);
    return `INV#${datePart}${fallbackNum}`;
  }
};

module.exports = {
  generateIncrementId,
  generateUnitCode,
  generateVariantUnitCode,
  generatePriceUnitCode,
  generateCustomerID,
  generateUserID,
  generateRentID,
  generateDetailRentID,
  generatePaymentID,
  generateInvoiceNumber,
};
