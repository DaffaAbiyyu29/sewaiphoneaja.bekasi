const TrnDetailRent = require("../../models/TrnDetailRental");
const MstUnit = require("../../models/MstUnit");
const MstVariantUnit = require("../../models/MstVariantUnit");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const sequelize = require("../../models/index");
const { generateIncrementId } = require("../../helpers/generateID");

const createDetail = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { rent_id, unit_code, variant_unit_code, price, qty, created_by } =
      req.body;

    // =====================
    // VALIDASI REQUEST
    // =====================
    const missing = [];
    if (!rent_id) missing.push("rent_id");
    if (!unit_code) missing.push("unit_code");
    if (!variant_unit_code) missing.push("variant_unit_code");
    if (price === undefined || price === null || price === "") missing.push("price");

    if (missing.length) {
      await t.rollback();
      return resError(
        res,
        "Data detail rental tidak lengkap",
        `Missing fields: ${missing.join(", ")}`,
        400
      );
    }

    const q = qty !== undefined && qty !== null && qty !== "" ? Number(qty) : 1;
    if (!Number.isFinite(q) || q <= 0) {
      await t.rollback();
      return resError(res, "qty tidak valid", "qty harus > 0", 400);
    }

    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) {
      await t.rollback();
      return resError(res, "price tidak valid", "price harus > 0", 400);
    }

    // =====================
    // CEK UNIT ADA?
    // =====================
    const unit = await MstUnit.findOne({
      where: { unit_code },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!unit) {
      await t.rollback();
      return resError(res, "Unit tidak ditemukan", "Not Found", 404);
    }

    // =====================
    // CEK VARIANT ADA & MILIK UNIT?
    // =====================
    // kalau tabel mst_variant_unit punya kolom unit_code, kita pakai itu buat validasi relasi
    const variantWhere = { variant_unit_code };

    // ✅ ini membuat kode kamu tetap jalan walau struktur DB beda
    if (MstVariantUnit.rawAttributes && MstVariantUnit.rawAttributes.unit_code) {
      variantWhere.unit_code = unit_code;
    }

    const variant = await MstVariantUnit.findOne({
      where: variantWhere,
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!variant) {
      await t.rollback();
      return resError(
        res,
        "Variant tidak ditemukan",
        "Variant tidak ada / bukan milik unit tersebut",
        404
      );
    }

    // =====================
    // CEK STOK
    // =====================
    const currentStock = Number(variant.qty || 0);

    if (currentStock < q) {
      await t.rollback();
      return resError(
        res,
        "Stok tidak cukup",
        `Stok tersedia: ${currentStock}, diminta: ${q}`,
        409
      );
    }

    // =====================
    // KURANGI STOK VARIANT
    // =====================
    const newStock = currentStock - q;

    await variant.update(
      {
        qty: newStock,
        // opsional: update status variant kalau stok habis
        ...(MstVariantUnit.rawAttributes && MstVariantUnit.rawAttributes.status
          ? { status: newStock === 0 ? "Unavailable" : "Available" }
          : {}),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    // =====================
    // CREATE DETAIL RENTAL
    // =====================
    const detail_id = await generateIncrementId(TrnDetailRent, "detail_id", "DET");
    const subtotal = p * q;

    const newDetail = await TrnDetailRent.create(
      {
        detail_id,
        rent_id,
        unit_code,
        variant_unit_code,
        price: p,
        qty: q,
        subtotal,
        created_at: new Date(),
        created_by: created_by || null,
      },
      { transaction: t }
    );

    await t.commit();
    return resSuccess(res, "Detail rental berhasil dibuat", newDetail, null, 201);
  } catch (err) {
    await t.rollback();
    return resError(res, "Gagal membuat detail rental", err.message, 500);
  }
};


// const getDetails = async (req, res) => {
//   try {
//     const { rent_id, unit_code } = req.query;
//     const where = {};
//     if (rent_id) where.rent_id = rent_id;
//     if (unit_code) where.unit_code = unit_code;

//     const details = await TrnDetailRent.findAll({
//       where,
//       order: [["created_at", "ASC"]],
//       include: [
//         {
//           model: MstUnit,
//           as: "unit",
//           attributes: ["unit_code", "unit_name"],
//           required: false,
//         },
//         {
//           model: MstVariantUnit,
//           as: "variant",
//           attributes: ["variant_unit_code", "color", "photo"],
//           required: false,
//         },
//       ],
//     });

//     // Tambahkan unit_name dan variant_name untuk kemudahan di frontend
//     const formatted = details.map((item) => {
//       const json = item.toJSON();

//       const unit_name = json.unit?.unit_name || null;
//       const variant_name = json.variant?.color || null;
//       const variant_photo = json.variant?.photo || null;

//       delete json.unit;
//       delete json.variant;

//       return {
//         ...json,
//         unit_name,
//         variant_name,
//         variant_photo,
//       };
//     });

//     return resSuccess(res, "Daftar detail rental berhasil diambil", formatted);
//   } catch (err) {
//     return resError(
//       res,
//       "Gagal mengambil daftar detail rental",
//       err.message,
//       500
//     );
//   }
// };

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
  // getDetails,
  getDetailById,
  updateDetail,
  deleteDetail,
};
