const { generateVariantUnitCode } = require("../../helpers/generateID");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const MstVariantUnit = require("../../models/MstVariantUnit");
const MstUnit = require("../../models/MstUnit");
const path = require("path");
const fs = require("fs");

const getVariantUnitByUnitCode = async (req, res) => {
  try {
    const { variantUnitCode } = req.params;
    const { count, rows } = await MstVariantUnit.findAndCountAll({
      where: { variant_unit_code: variantUnitCode },
    });

    if (count === 0) {
      return resSuccess(res, "Variant unit tidak ditemukan", rows);
    }

    return resSuccess(res, "Daftar varian unit berhasil diambil", rows[0]);
  } catch (err) {
    return resError(res, "Gagal mengambil data varian unit", err.message, 500);
  }
};

// ====
// CREATE VARIANT UNIT
// ====
const createVariantUnit = async (req, res) => {
  try {
    const { unit_code, color, qty, status } = req.body;

    // Pastikan unit yang dimaksud ada
    const unit = await MstUnit.findOne({ where: { unit_code } });
    if (!unit) {
      return resError(res, "Unit tidak ditemukan", "Not Found", 404);
    }

    // Buat kode variant baru
    const variantUnitCode = await generateVariantUnitCode();

    // Simpan foto jika ada
    let photoName = null;
    if (req.file) {
      photoName = req.file.filename;
    }

    // Simpan ke database
    const newVariant = await MstVariantUnit.create({
      variant_unit_code: variantUnitCode,
      unit_code,
      color,
      qty,
      status,
      photo: photoName,
    });

    return resSuccess(res, "Varian unit berhasil dibuat", newVariant);
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal membuat varian unit", err.message, 500);
  }
};

// ====
// UPDATE VARIANT UNIT
// ====
const updateVariantUnit = async (req, res) => {
  try {
    const { variantUnitCode } = req.params;
    const { color, qty, status } = req.body;

    // Cari data variant berdasarkan kode
    const variant = await MstVariantUnit.findOne({
      where: { variant_unit_code: variantUnitCode },
    });

    if (!variant) {
      return resError(res, "Varian tidak ditemukan", "Not Found", 404);
    }

    // Jika ada file baru (foto)
    let photoName = variant.photo; // default pakai foto lama
    if (req.file) {
      // Hapus foto lama jika ada
      if (variant.photo) {
        const oldPath = path.join(
          __dirname,
          "../../public/uploads",
          variant.photo
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Simpan nama file baru
      photoName = req.file.filename;
    }

    // Update data variant
    await variant.update({
      color,
      qty,
      status,
      photo: photoName,
    });

    return resSuccess(res, "Varian unit berhasil diperbarui", variant);
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal memperbarui varian unit", err.message, 500);
  }
};

// ====
// DELETE VARIANT UNIT
// ====
const deleteVariantUnit = async (req, res) => {
  try {
    const { variantUnitCode } = req.params;

    // Cari varian dulu
    const variant = await MstVariantUnit.findOne({
      where: { variant_unit_code: variantUnitCode },
    });

    if (!variant) {
      return resError(res, "Varian unit tidak ditemukan", "Not Found", 404);
    }

    // Hapus file foto jika ada
    if (variant.photo) {
      const filePath = path.join(
        __dirname,
        "../../public/uploads",
        variant.photo
      );
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (fsErr) {
        console.error("Gagal hapus file foto variant:", fsErr);
        // kita lanjutkan walau gagal hapus file fisik
      }
    }

    // Hapus dari DB
    await variant.destroy();

    return resSuccess(res, "Varian unit berhasil dihapus");
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal menghapus varian unit", err.message, 500);
  }
};

module.exports = {
  getVariantUnitByUnitCode,
  createVariantUnit,
  updateVariantUnit,
  deleteVariantUnit,
};
