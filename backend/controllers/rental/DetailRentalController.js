const TrnDetailRent = require("../../models/TrnDetailRental");
const MstUnit = require("../../models/MstUnit");
const MstVariantUnit = require("../../models/MstVariantUnit");
const { resSuccess, resError } = require("../../helpers/sendResponse");

const { generateIncrementId } = require("../../helpers/generateID");

const createDetail = async (req, res) => {
  try {
    const { rent_id, unit_code, variant_unit_code, price, qty, created_by } =
      req.body;

    const missing = [];
    if (!rent_id) missing.push("rent_id");
    if (!unit_code) missing.push("unit_code");
    if (price === undefined || price === null || price === "")
      missing.push("price");
    if (missing.length)
      return resError(
        res,
        "Data detail rental tidak lengkap",
        `Missing fields: ${missing.join(", ")}`,
        400
      );

    const detail_id = await generateIncrementId(
      TrnDetailRent,
      "detail_id",
      "DET"
    );
    const q = qty !== undefined && qty !== null && qty !== "" ? Number(qty) : 1;
    const p = Number(price);
    const subtotal = p * q;

    const newDetail = await TrnDetailRent.create({
      detail_id,
      rent_id,
      unit_code,
      variant_unit_code: variant_unit_code || null,
      price: p,
      qty: q,
      subtotal,
      created_at: new Date(),
      created_by: created_by || null,
    });

    return resSuccess(
      res,
      "Detail rental berhasil dibuat",
      newDetail,
      null,
      201
    );
  } catch (err) {
    return resError(res, "Gagal membuat detail rental", err.message, 500);
  }
};

const getDetails = async (req, res) => {
  try {
    const { rent_id, unit_code } = req.query;
    const where = {};
    if (rent_id) where.rent_id = rent_id;
    if (unit_code) where.unit_code = unit_code;

    const details = await TrnDetailRent.findAll({
      where,
      order: [["created_at", "ASC"]],
      include: [
        {
          model: MstUnit,
          as: "unit",
          attributes: ["unit_code", "unit_name"],
          required: false,
        },
        {
          model: MstVariantUnit,
          as: "variant",
          attributes: ["variant_unit_code", "color", "photo"],
          required: false,
        },
      ],
    });

    // Tambahkan unit_name dan variant_name untuk kemudahan di frontend
    const formatted = details.map((item) => {
      const json = item.toJSON();

      const unit_name = json.unit?.unit_name || null;
      const variant_name = json.variant?.color || null;
      const variant_photo = json.variant?.photo || null;

      delete json.unit;
      delete json.variant;

      return {
        ...json,
        unit_name,
        variant_name,
        variant_photo,
      };
    });

    return resSuccess(res, "Daftar detail rental berhasil diambil", formatted);
  } catch (err) {
    return resError(
      res,
      "Gagal mengambil daftar detail rental",
      err.message,
      500
    );
  }
};

const getDetailById = async (req, res) => {
  try {
    const { detailId } = req.params;
    const detail = await TrnDetailRent.findOne({
      where: { detail_id: detailId },
    });
    if (!detail)
      return resError(res, "Detail rental tidak ditemukan", "Not Found", 404);
    return resSuccess(res, "Data detail rental berhasil diambil", detail);
  } catch (err) {
    return resError(res, "Gagal mengambil detail rental", err.message, 500);
  }
};

const updateDetail = async (req, res) => {
  try {
    const { detailId } = req.params;
    const { unit_code, variant_unit_code, price, qty, updated_by } = req.body;

    const detail = await TrnDetailRent.findOne({
      where: { detail_id: detailId },
    });
    if (!detail)
      return resError(res, "Detail rental tidak ditemukan", "Not Found", 404);

    const newQty =
      qty !== undefined && qty !== null && qty !== ""
        ? Number(qty)
        : detail.qty;
    const newPrice =
      price !== undefined && price !== null && price !== ""
        ? Number(price)
        : detail.price;
    const newSubtotal = Number(newPrice) * Number(newQty);

    await detail.update({
      unit_code: unit_code ?? detail.unit_code,
      variant_unit_code: variant_unit_code ?? detail.variant_unit_code,
      price: newPrice,
      qty: newQty,
      subtotal: newSubtotal,
      updated_at: new Date(),
      updated_by: updated_by || detail.updated_by,
    });

    return resSuccess(res, "Detail rental berhasil diperbarui", detail);
  } catch (err) {
    return resError(res, "Gagal memperbarui detail rental", err.message, 500);
  }
};

const deleteDetail = async (req, res) => {
  try {
    const { detailId } = req.params;
    const deleted = await TrnDetailRent.destroy({
      where: { detail_id: detailId },
    });
    if (!deleted)
      return resError(res, "Detail rental tidak ditemukan", "Not Found", 404);
    return resSuccess(res, "Detail rental berhasil dihapus");
  } catch (err) {
    return resError(res, "Gagal menghapus detail rental", err.message, 500);
  }
};

module.exports = {
  createDetail,
  getDetails,
  getDetailById,
  updateDetail,
  deleteDetail,
};
