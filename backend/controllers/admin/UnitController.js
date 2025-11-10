const { Op } = require("sequelize");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const MstUnit = require("../../models/MstUnit");
const MstVariantUnit = require("../../models/MstVariantUnit");
const MstPriceUnit = require("../../models/MstPriceUnit");

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
    const allowedLimits = [5, 10, 25, 50, 100];
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
    
    const allowedLimits = [5, 10, 25, 50, 100];
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
      return resError(res, "Varian unit tidak ditemukan untuk kode ini", "Not Found", 404);
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

    const allowedLimits = [5, 10, 25, 50, 100];
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
      const numericFilters = isNaN(numericSearch) ? [] : [
        { duration: numericSearch },
        { price_per_day: numericSearch },
      ];
      
      // Gabungkan semua filter dalam Op.or
      searchWhere = {
        [Op.or]: [...stringFilters, ...numericFilters]
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
      return resError(res, "Data harga unit tidak ditemukan untuk kode ini", "Not Found", 404);
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

module.exports = { getAllUnit, getUnitByCode, getVariantUnitByUnitCode, getPriceUnitByUnitCode };
