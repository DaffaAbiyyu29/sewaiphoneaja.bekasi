const { generatePriceUnitCode } = require("../../helpers/generateID");
const { resError, resSuccess } = require("../../helpers/sendResponse");
const MstPriceUnit = require("../../models/MstPriceUnit");
const MstUnit = require("../../models/MstUnit");

const getPriceUnitByUnitCode = async (req, res) => {
  try {
    const { priceId } = req.params;

    const priceUnits = await MstPriceUnit.findAll({
      where: { price_id: priceId },
      order: [["duration", "ASC"]],
    });

    return resSuccess(res, "Daftar price unit berhasil diambil", priceUnits);
  } catch (err) {
    return resError(res, "Gagal mengambil data price unit", err.message, 500);
  }
};

// CREATE PRICE UNIT
const createPriceUnit = async (req, res) => {
  try {
    const { unit_code, duration, price_per_day, status } = req.body;
    const price_id = await generatePriceUnitCode();

    if (!unit_code || !duration || !price_per_day)
      return resError(res, "Data harga tidak lengkap", "Bad Request", 400);

    const parent = await MstUnit.findOne({ where: { unit_code } });
    if (!parent)
      return resError(res, "Unit induk tidak ditemukan", "Not Found", 404);

    const newPrice = await MstPriceUnit.create({
      price_id,
      unit_code,
      duration,
      price_per_day,
      status: status || "Active",
    });

    return resSuccess(res, "Harga unit berhasil dibuat", newPrice);
  } catch (err) {
    return resError(res, "Gagal membuat harga unit", err.message, 500);
  }
};

// UPDATE PRICE UNIT
const updatePriceUnit = async (req, res) => {
  try {
    const { priceId } = req.params;
    const { duration, price_per_day, status } = req.body;

    const price = await MstPriceUnit.findOne({ where: { price_id: priceId } });

    if (!price)
      return resError(res, "Harga unit tidak ditemukan", "Not Found", 404);

    await price.update({ duration, price_per_day, status });
    return resSuccess(res, "Harga unit berhasil diperbarui", price);
  } catch (err) {
    return resError(res, "Gagal memperbarui harga unit", err.message, 500);
  }
};

// DELETE PRICE UNIT
const deletePriceUnit = async (req, res) => {
  try {
    const { priceId } = req.params;

    const deleted = await MstPriceUnit.destroy({
      where: { price_id: priceId },
    });
    if (!deleted)
      return resError(res, "Harga unit tidak ditemukan", "Not Found", 404);

    return resSuccess(res, "Harga unit berhasil dihapus");
  } catch (err) {
    return resError(res, "Gagal menghapus harga unit", err.message, 500);
  }
};

module.exports = { createPriceUnit, updatePriceUnit, deletePriceUnit };
