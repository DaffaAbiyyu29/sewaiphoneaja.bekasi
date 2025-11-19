const { Op } = require("sequelize");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const MstUnit = require("../../models/MstUnit");
const MstVariantUnit = require("../../models/MstVariantUnit");
const MstPriceUnit = require("../../models/MstPriceUnit");
const { generateUnitCode } = require("../../helpers/generateID");
const { deletePhoto } = require("../../middleware/upload");

// GET all units
const getAllUnit = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      orderBy = "created_at",
      orderDir = "DESC",
    } = req.query;

    // pastikan angka valid
    page = parseInt(page);
    limit = parseInt(limit);

    // kalau user kasih limit diluar opsi normal (10/25/50/100), fallback ke 10
    const allowedLimits = [10, 25, 50, 100];
    if (!allowedLimits.includes(limit)) limit = 10;

    const offset = (page - 1) * limit;

    const searchableFields = [
      "unit_code",
      "unit_name",
      "brand",
      "description",
      "status",
    ];

    const where =
      search.trim() !== ""
        ? {
            [Op.or]: searchableFields.map((field) => ({
              [field]: { [Op.like]: `%${search}%` },
            })),
          }
        : {};

    const allowedOrderFields = [
      "unit_code",
      "unit_name",
      "brand",
      "description",
      "status",
      "created_at",
      "updated_at",
    ];

    const orderField = allowedOrderFields.includes(orderBy)
      ? orderBy
      : "created_at";
    const orderDirection = orderDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await MstUnit.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderField, orderDirection]],
    });

    const totalData = count;
    const totalPages = Math.ceil(count / limit);

    return resSuccess(res, "Daftar unit berhasil diambil", rows, {
      totalData,
      currentPage: page,
      totalPages,
      pageSize: limit,
      allowedPageSizes: allowedLimits, // info untuk frontend
    });
  } catch (err) {
    return resError(res, "Gagal mengambil data unit", err.message, 500);
  }
};

// GET unit by code
const getUnitByCode = async (req, res) => {
  try {
    const { unitCode } = req.params;
    const unit = await MstUnit.findOne({
      where: { unit_code: unitCode },
    });

    if (!unit) return resError(res, "Unit tidak ditemukan", "Not Found", 404);

    return resSuccess(res, "Unit berhasil ditemukan", unit);
  } catch (err) {
    return resError(res, "Gagal mengambil data unit", err.message, 500);
  }
};

// Pastikan Anda telah mengimpor Op dari sequelize: const { Op } = require('sequelize');

const getVariantUnitByUnitCode = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      orderBy = "created_at",
      orderDir = "DESC",
    } = req.query;

    const { unitCode } = req.params; // Ambil unit_code dari parameter URL

    // --- 1. Validasi dan Kalkulasi Paginasi ---
    page = parseInt(page);
    limit = parseInt(limit);

    const allowedLimits = [10, 25, 50, 100];
    if (!allowedLimits.includes(limit)) limit = 10;

    const offset = (page - 1) * limit;

    // --- 2. Filter Utama (unit_code) ---
    const primaryWhere = {
      unit_code: unitCode,
    };

    // --- 3. Filter Pencarian (Search) ---
    const searchableFields = ["variant_unit_code", "color", "status"];

    const searchWhere =
      search.trim() !== ""
        ? {
            [Op.or]: searchableFields.map((field) => ({
              [field]: { [Op.like]: `%${search}%` },
            })),
          }
        : {};

    // Gabungkan primaryWhere (unit_code) dan searchWhere
    const where = { ...primaryWhere, ...searchWhere };

    // --- 4. Sorting ---
    const allowedOrderFields = [
      "variant_unit_code",
      "color",
      "qty",
      "status",
      "created_at",
    ];

    const orderField = allowedOrderFields.includes(orderBy)
      ? orderBy
      : "created_at";
    const orderDirection = orderDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // --- 5. Ambil Data ---
    const { count, rows } = await MstVariantUnit.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderField, orderDirection]],
    });

    // --- 6. Hitung Paginasi Hasil ---
    const totalData = count;
    const totalPages = Math.ceil(count / limit);

    if (totalData === 0) {
      return resSuccess(res, "Varian unit tidak ditemukan", rows, {
        totalData,
        currentPage: page,
        totalPages,
        pageSize: limit,
        allowedPageSizes: allowedLimits,
      });
    }

    return resSuccess(res, "Daftar varian unit berhasil diambil", rows, {
      totalData,
      currentPage: page,
      totalPages,
      pageSize: limit,
      allowedPageSizes: allowedLimits,
    });
  } catch (err) {
    return resError(res, "Gagal mengambil data varian unit", err.message, 500);
  }
};

const getPriceUnitByUnitCode = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      orderBy = "duration",
      orderDir = "ASC",
    } = req.query;

    const { unitCode } = req.params; // Ambil unit_code dari parameter URL

    // --- 1. Validasi dan Kalkulasi Paginasi ---
    page = parseInt(page);
    limit = parseInt(limit);

    const allowedLimits = [10, 25, 50, 100];
    if (!allowedLimits.includes(limit)) limit = 10;

    const offset = (page - 1) * limit;

    // --- 2. Filter Utama (unit_code) ---
    const primaryWhere = {
      unit_code: unitCode,
    };

    // --- 3. Filter Pencarian (Search) ---
    // Pencarian di tabel harga biasanya berdasarkan status atau duration/price_per_day
    const searchableFields = ["price_id", "status"];

    let searchWhere = {};

    if (search.trim() !== "") {
      // Coba parse search sebagai angka untuk duration atau price
      const numericSearch = parseFloat(search);

      // Filter string (price_id, status)
      const stringFilters = searchableFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      }));

      // Filter numerik (duration, price_per_day)
      const numericFilters = isNaN(numericSearch)
        ? []
        : [{ duration: numericSearch }, { price_per_day: numericSearch }];

      // Gabungkan semua filter dalam Op.or
      searchWhere = {
        [Op.or]: [...stringFilters, ...numericFilters],
      };
    }

    // Gabungkan primaryWhere (unit_code) dan searchWhere
    const where = { ...primaryWhere, ...searchWhere };

    // --- 4. Sorting ---
    const allowedOrderFields = [
      "price_id",
      "duration",
      "price_per_day",
      "status",
      "created_at",
    ];

    const orderField = allowedOrderFields.includes(orderBy)
      ? orderBy
      : "duration";
    const orderDirection = orderDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // --- 5. Ambil Data ---
    const { count, rows } = await MstPriceUnit.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderField, orderDirection]],
    });

    // --- 6. Hitung Paginasi Hasil ---
    const totalData = count;
    const totalPages = Math.ceil(count / limit);

    if (totalData === 0) {
      return resSuccess(
        res,
        "Data harga unit tidak ditemukan untuk kode ini",
        rows,
        {
          totalData,
          currentPage: page,
          totalPages,
          pageSize: limit,
          allowedPageSizes: allowedLimits,
        }
      );
    }

    return resSuccess(res, "Daftar harga unit berhasil diambil", rows, {
      totalData,
      currentPage: page,
      totalPages,
      pageSize: limit,
      allowedPageSizes: allowedLimits,
    });
  } catch (err) {
    return resError(res, "Gagal mengambil data harga unit", err.message, 500);
  }
};

// =============================================
// Tambahan fungsi CREATE, UPDATE, DELETE
// =============================================

// CREATE UNIT
const createUnit = async (req, res) => {
  const photoPath = req.file ? req.file.path : null;
  const photoName = req.file ? req.file.filename : null;

  try {
    const { unit_name, brand, description, status } = req.body;
    const unit_code = await generateUnitCode();

    // --- 1. Validasi Awal ---
    if (!unit_code || !unit_name) {
      deletePhoto(photoPath);
      return resError(
        res,
        "Kode dan nama unit wajib diisi",
        "Bad Request",
        400
      );
    }

    // --- 2. Cek Duplikasi Unit Code ---
    const existing = await MstUnit.findOne({ where: { unit_code } });
    if (existing) {
      deletePhoto(photoPath);
      return resError(res, "Kode unit sudah terdaftar", "Conflict", 409);
    }

    // --- 3. Buat Unit Baru ---
    const newUnit = await MstUnit.create({
      unit_code,
      unit_name,
      brand,
      description,
      status,
      photo: photoName,
    });

    return resSuccess(res, "Unit berhasil dibuat", newUnit);
  } catch (err) {
    // --- 4. Error Catch-All ---
    deletePhoto(photoPath); // Tetap hapus berdasarkan photoPath

    return resError(res, "Gagal membuat unit", err.message, 500);
  }
};

// UPDATE UNIT
const updateUnit = async (req, res) => {
  // Ambil path dan nama file foto baru (jika ada) dari middleware multer
  const newPhotoPath = req.file ? req.file.path : null;
  const newPhotoName = req.file ? req.file.filename : null;

  try {
    const { unitCode } = req.params;
    // Tambahkan 'delete_image' dari body untuk menangani penghapusan foto
    const { unit_name, brand, description, status, delete_image } = req.body;

    // --- 1. Cari Unit ---
    const unit = await MstUnit.findOne({ where: { unit_code: unitCode } });
    if (!unit) {
      if (newPhotoPath) deletePhoto(newPhotoPath);
      return resError(res, "Unit tidak ditemukan", "Not Found", 404);
    }

    const oldPhotoName = unit.photo;

    // --- 2. Siapkan Data Update ---
    const updateData = {
      unit_name,
      brand,
      description,
      status,
    };

    // --- Logika Update Foto ---
    if (newPhotoName) {
      // Kasus A: Ada foto baru diunggah (GANTI FOTO)
      updateData.photo = newPhotoName;
    } else if (delete_image && delete_image === "true") {
      updateData.photo = null;
    }

    // --- 3. Perbarui Unit di Database ---
    await unit.update(updateData);

    // --- 4. Hapus File Foto Lama di Filesystem (jika ada penggantian atau penghapusan) ---
    if (
      oldPhotoName &&
      (newPhotoName || (delete_image && delete_image === "true"))
    ) {
      deletePhoto(oldPhotoName);
    }

    return resSuccess(res, "Unit berhasil diperbarui", unit);
  } catch (err) {
    // --- 5. Error Catch-All ---
    if (newPhotoPath) deletePhoto(newPhotoPath);

    return resError(res, "Gagal memperbarui unit", err.message, 500);
  }
};

// DELETE UNIT
const deleteUnit = async (req, res) => {
  try {
    const { unitCode } = req.params;

    // 1️⃣ Cek apakah unit dengan kode tersebut ada
    const unit = await MstUnit.findOne({ where: { unit_code: unitCode } });
    if (!unit) {
      return resError(res, "Unit tidak ditemukan", "Not Found", 404);
    }

    // 2️⃣ Simpan nama foto lama (jika ada)
    const oldPhotoName = unit.photo;

    // 3️⃣ Hapus unit dari database
    await MstUnit.destroy({ where: { unit_code: unitCode } });

    // 4️⃣ Jika unit memiliki foto, hapus juga file fisiknya
    if (oldPhotoName) {
      deletePhoto(oldPhotoName); // fungsi ini sudah kamu import dari upload.js
    }

    // 5️⃣ Kirim respons sukses
    return resSuccess(res, "Unit berhasil dihapus", {
      deleted_unit_code: unitCode,
      deleted_unit_name: unit.unit_name,
      deleted_photo: oldPhotoName || null,
    });
  } catch (err) {
    return resError(res, "Gagal menghapus unit", err.message, 500);
  }
};


// =============================================
// UPDATE EXPORT agar semua fungsi dikenali
// =============================================
module.exports = {
  // GET (asli)
  getAllUnit,
  getUnitByCode,
  getVariantUnitByUnitCode,
  getPriceUnitByUnitCode,
  // CREATE
  createUnit,
  // UPDATE
  updateUnit,
  // DELETE
  deleteUnit,
};
