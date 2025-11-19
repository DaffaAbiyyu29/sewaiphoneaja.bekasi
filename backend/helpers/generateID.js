const MstPriceUnit = require("../models/MstPriceUnit");
const MstUnit = require("../models/MstUnit");
const MstVariantUnit = require("../models/MstVariantUnit");
const MstCustomer = require("../models/MstCustomer");

const generateUnitCode = async () => {
  // Ambil unit terakhir dari database
  const lastUnit = await MstUnit.findOne({
    order: [["created_at", "DESC"]],
  });

  // Ambil angka terakhir dari kode sebelumnya (misal: UNIT-0005 → 5)
  let nextNumber = 1;
  if (lastUnit && lastUnit.unit_code) {
    const match = lastUnit.unit_code.match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1]) + 1;
  }

  // Format ke kode baru: UNIT-0001
  return `UNT${String(nextNumber).padStart(4, "0")}`;
};

const generateVariantUnitCode = async () => {
  // Ambil unit terakhir dari database
  const lastUnit = await MstVariantUnit.findOne({
    order: [["created_at", "DESC"]],
  });

  // Ambil angka terakhir dari kode sebelumnya (misal: UNIT-0005 → 5)
  let nextNumber = 1;
  if (lastUnit && lastUnit.variant_unit_code) {
    const match = lastUnit.variant_unit_code.match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1]) + 1;
  }

  // Format ke kode baru: UNIT-0001
  return `VNT${String(nextNumber).padStart(4, "0")}`;
};

const generatePriceUnitCode = async () => {
  // Ambil unit terakhir dari database
  const lastUnit = await MstPriceUnit.findOne({
    order: [["created_at", "DESC"]],
  });

  // Ambil angka terakhir dari kode sebelumnya (misal: UNIT-0005 → 5)
  let nextNumber = 1;
  if (lastUnit && lastUnit.price_id) {
    const match = lastUnit.price_id.match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1]) + 1;
  }

  // Format ke kode baru: UNIT-0001
  return `PNT${String(nextNumber).padStart(4, "0")}`;
};

const generateCustomerID = async () => {
  // Ambil customer terakhir dari database
  const lastCustomer = await MstCustomer.findOne({
    order: [["created_at", "DESC"]],
  });

  // Ambil angka terakhir dari kode sebelumnya (misal: CUST-0001 → 1)
  let nextNumber = 1;
  if (lastCustomer && lastCustomer.customer_id) {
    const match = lastCustomer.customer_id.match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1]) + 1;
  }

  // Format ke kode baru: CUST-0001
  return `CST${String(nextNumber).padStart(4, "0")}`;
};

module.exports = {
  generateUnitCode,
  generateVariantUnitCode,
  generatePriceUnitCode,
  generateCustomerID,
};
