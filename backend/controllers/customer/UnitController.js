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
      orderBy = "created_at",
      orderDir = "DESC",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const allowedLimits = [9];
    if (!allowedLimits.includes(limit)) limit = 9;

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
      distinct: true, // biar count gak dobel karena join
    });

    const totalData = count;
    const totalPages = Math.ceil(count / limit);

    // LOGIKA PENANGANAN DATA KOSONG
    let message = "Daftar unit berhasil diambil";
    if (totalData === 0) {
      if (search.trim() !== "") {
        message =
          "Tidak ada unit yang ditemukan dengan kriteria pencarian tersebut.";
      } else {
        message = "Tidak ada data unit yang tersedia.";
      }
    }
    // AKHIR LOGIKA

    return resSuccess(res, message, rows, {
      totalData,
      currentPage: page,
      totalPages,
      pageSize: limit,
      allowedPageSizes: allowedLimits,
    });
  } catch (err) {
    // Ini menangani error saat koneksi database atau query gagal (bukan data kosong)
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

module.exports = {
  getAllUnitCatalog,
  getCatalogByUnitCode,
};
