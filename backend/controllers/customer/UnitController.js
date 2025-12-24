const { Op } = require("sequelize");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const {
  MstUnit,
  MstVariantUnit,
  MstPriceUnit,
} = require("../../models/Relations");

const getAllUnitCatalog = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 9,
      search = "",
      status = "all", // all | available | unavailable (FE)
      orderBy = "created_at",
      orderDir = "DESC",
    } = req.query;

    // =====================
    // Pagination
    // =====================
    page = parseInt(page);
    limit = parseInt(limit);

    const allowedLimits = [9];
    if (!allowedLimits.includes(limit)) limit = 9;

    const offset = (page - 1) * limit;

    // =====================
    // Search
    // =====================
    const searchableFields = [
      "unit_code",
      "unit_name",
      "brand",
      "description",
      "status",
    ];

    const where = {
      ...(search.trim() !== ""
        ? {
            [Op.or]: searchableFields.map((field) => ({
              [field]: { [Op.like]: `%${search}%` },
            })),
          }
        : {}),
    };

    // =====================
    // Sorting
    // =====================
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

    // =====================
    // QUERY DATA
    // =====================
    const { count, rows } = await MstUnit.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: MstVariantUnit,
          as: "variants",
          attributes: ["variant_unit_code", "color", "qty", "status", "photo"],
        },
        {
          model: MstPriceUnit,
          as: "prices",
          where: { status: "Active" },
          attributes: ["price_id", "duration", "price_per_day", "status"],
        },
      ],
      order: [[orderField, orderDirection]],
      distinct: true, // biar count gak dobel
    });

    // =====================
    // OVERRIDE STATUS BERDASARKAN STOK VARIANT
    // =====================
    const processedRows = rows.map((unit) => {
      const totalStock =
        unit.variants?.reduce((sum, v) => sum + (v.qty || 0), 0) || 0;

      let finalStatus = unit.status;

      // rule bisnis:
      // unit Available tapi stok 0 => Unavailable
      if (unit.status === "Available" && totalStock === 0) {
        finalStatus = "Unavailable";
      }

      return {
        ...unit.toJSON(),
        status: finalStatus,
        totalStock,
      };
    });

    // =====================
    // FILTER STATUS DARI FE
    // =====================
    let filteredRows = processedRows;

    if (status === "available") {
      filteredRows = processedRows.filter((u) => u.status === "Available");
    }

    if (status === "unavailable") {
      filteredRows = processedRows.filter((u) => u.status === "Unavailable");
    }

    // =====================
    // PAGINATION SETELAH FILTER
    // =====================
    const totalData = filteredRows.length;
    const totalPages = Math.ceil(totalData / limit);

    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit);

    // =====================
    // MESSAGE
    // =====================
    let message = "Daftar unit berhasil diambil";

    if (totalData === 0) {
      if (search.trim() !== "") {
        message =
          "Tidak ada unit yang ditemukan dengan kriteria pencarian tersebut.";
      } else {
        message = "Tidak ada data unit yang tersedia.";
      }
    }

    // =====================
    // RESPONSE
    // =====================
    return resSuccess(res, message, paginatedRows, {
      totalData,
      currentPage: page,
      totalPages,
      pageSize: limit,
      allowedPageSizes: allowedLimits,
    });
  } catch (err) {
    console.error("getAllUnitCatalog error:", err);
    return resError(res, "Gagal mengambil data unit", err.message, 500);
  }
};

const getCatalogByUnitCode = async (req, res) => {
  const { unitCode } = req.params;

  try {
    const { count, rows } = await MstUnit.findAndCountAll({
      where: { unit_code: unitCode },
      include: [
        {
          model: MstVariantUnit,
          as: "variants",
          attributes: ["variant_unit_code", "color", "qty", "status", "photo"],
        },
        {
          model: MstPriceUnit,
          as: "prices",
          where: { status: "Active" },
          attributes: ["price_id", "duration", "price_per_day", "status"],
        },
      ],
      distinct: true,
    });

    let message = "Daftar unit berhasil diambil";
    if (count === 0) {
      message = "Data Unit tidak ditemukan. ";
    }

    return resSuccess(res, message, rows[0]);
  } catch (err) {
    return resError(res, "Gagal mengambil data unit", err.message, 500);
  }
};

const getCatalogByInvoiceOrNik = async (req, res) => {
  const { unitCode } = req.params;

  try {
    const { count, rows } = await MstUnit.findAndCountAll({
      where: { unit_code: unitCode },
      include: [
        {
          model: MstVariantUnit,
          as: "variants",
          attributes: ["variant_unit_code", "color", "qty", "status", "photo"],
        },
        {
          model: MstPriceUnit,
          as: "prices",
          where: { status: "Active" },
          attributes: ["price_id", "duration", "price_per_day", "status"],
        },
      ],
      distinct: true,
    });

    let message = "Daftar unit berhasil diambil";
    if (count === 0) {
      message = "Data Unit tidak ditemukan. ";
    }

    return resSuccess(res, message, rows[0]);
  } catch (err) {
    return resError(res, "Gagal mengambil data unit", err.message, 500);
  }
};

module.exports = {
  getAllUnitCatalog,
  getCatalogByUnitCode,
};
