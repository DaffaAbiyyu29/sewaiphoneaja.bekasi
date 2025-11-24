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
};
