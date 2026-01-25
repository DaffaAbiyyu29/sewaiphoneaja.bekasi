const { Op } = require("sequelize");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const {
  MstUnit,
  MstVariantUnit,
  MstPriceUnit,
  TrnRent,
  TrnDetailRent,
} = require("../../models/Relations");
const sequelize = require("../../models/index");
const { toUTC } = require("../../helpers/format");

const getAllUnitCatalog = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 9,
      search = "",
      status = "all",
      orderBy = "created_at",
      orderDir = "DESC",
      start_date,
      end_date,
      variant_unit_code,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    if (![9].includes(limit)) limit = 9;

    const offset = (page - 1) * limit;

    const where = {
      is_delete: 0,
      ...(search.trim()
        ? {
            [Op.or]: [
              "unit_code",
              "unit_name",
              "brand",
              "description",
              "status",
            ].map((f) => ({ [f]: { [Op.like]: `%${search}%` } })),
          }
        : {}),
    };

    const { rows } = await MstUnit.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: MstVariantUnit,
          as: "variants",
          where: { is_delete: 0 },
          required: false, // 🔥 penting
          attributes: ["variant_unit_code", "color", "qty", "status", "photo"],
        },
        {
          model: MstPriceUnit,
          as: "prices",
          where: { status: "Active", is_delete: 0 },
          required: false,
        },
      ],
      order: [[orderBy, orderDir]],
      distinct: true,
    });

    /** ===============================
     * RENTED MAP (ONLY SELECTED VARIANT)
     * =============================== */
    let rentedMap = {};
    const useDateFilter = start_date && end_date && variant_unit_code;

    if (useDateFilter) {
      const startDateUTC = toUTC(start_date);
      const endDateUTC = toUTC(end_date, true);

      const rented = await TrnDetailRent.findAll({
        attributes: [
          "variant_unit_code",
          [sequelize.fn("SUM", sequelize.col("qty")), "total_rented"],
        ],
        include: [
          {
            model: TrnRent,
            as: "rent",
            attributes: [],
            where: {
              status: { [Op.notIn]: ["Close", "Cancelled"] },
              start_rent_date: { [Op.lte]: endDateUTC },
              end_rent_date: { [Op.gte]: startDateUTC },
            },
          },
        ],
        where: { variant_unit_code },
        group: ["variant_unit_code"],
        raw: true,
      });

      rented.forEach((r) => {
        rentedMap[r.variant_unit_code] = Number(r.total_rented);
      });
    }

    /** ===============================
     * PROCESS DATA
     * =============================== */
    const processedRows = rows.map((unit) => {
      let totalStock = 0;
      let availableStock = 0;
      let selectedVariantAvailable = 0;

      const variants = (unit.variants || []).map((v) => {
        const realQty = v.qty || 0;
        totalStock += realQty;

        // default: gak kena logic apa2
        let finalQty = realQty;
        let rentedQty = 0;

        // 🔥 LOGIC HANYA BUAT VARIANT TERPILIH
        if (useDateFilter && v.variant_unit_code === variant_unit_code) {
          rentedQty = rentedMap[v.variant_unit_code] || 0;
          finalQty = Math.max(realQty - rentedQty, 0);
          selectedVariantAvailable = finalQty;
        }

        availableStock += finalQty;

        return {
          ...v.toJSON(),
          qty: finalQty,
          // rented_qty: rentedQty,
        };
      });

      let finalStatus = unit.status;
      if (useDateFilter) {
        finalStatus =
          selectedVariantAvailable > 0 ? "Available" : "Unavailable";
      }

      return {
        ...unit.toJSON(),
        variants,
        totalStock,
        availableStock,
        status: finalStatus,
      };
    });

    /** ===============================
     * STATUS FILTER
     * =============================== */
    let filteredRows = processedRows;

    if (status === "available") {
      filteredRows = filteredRows.filter((u) => u.availableStock > 0);
    }

    if (status === "unavailable") {
      filteredRows = filteredRows.filter((u) => u.availableStock === 0);
    }

    const totalData = filteredRows.length;
    const totalPages = Math.ceil(totalData / limit);
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit);

    return resSuccess(res, "Daftar unit berhasil diambil", paginatedRows, {
      totalData,
      currentPage: page,
      totalPages,
      pageSize: limit,
    });
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal mengambil data unit", err.message, 500);
  }
};

const getCatalogByUnitCode = async (req, res) => {
  const { unitCode } = req.params;
  const { start_date, end_date, variant_unit_code } = req.query;

  try {
    const { rows } = await MstUnit.findAndCountAll({
      where: {
        unit_code: unitCode,
        is_delete: 0,
      },
      include: [
        {
          model: MstVariantUnit,
          as: "variants",
          where: { is_delete: 0 },
          required: false,
          attributes: ["variant_unit_code", "color", "qty", "status", "photo"],
        },
        {
          model: MstPriceUnit,
          as: "prices",
          where: { status: "Active", is_delete: 0 },
          required: false,
        },
      ],
      distinct: true,
    });

    if (!rows.length) {
      return resSuccess(res, "Data Unit tidak ditemukan", null);
    }

    const unit = rows[0];

    /** ===============================
     * DATE FILTER CHECK
     * =============================== */
    const useDateFilter = start_date && end_date && variant_unit_code;

    /** ===============================
     * RENTED MAP (ONLY SELECTED VARIANT)
     * =============================== */
    let rentedMap = {};

    if (useDateFilter) {
      const startDateUTC = toUTC(start_date);
      const endDateUTC = toUTC(end_date, true);

      const rented = await TrnDetailRent.findAll({
        attributes: [
          "variant_unit_code",
          [sequelize.fn("SUM", sequelize.col("qty")), "total_rented"],
        ],
        include: [
          {
            model: TrnRent,
            as: "rent",
            attributes: [],
            where: {
              status: { [Op.notIn]: ["Close", "Cancelled"] },
              start_rent_date: { [Op.lte]: endDateUTC },
              end_rent_date: { [Op.gte]: startDateUTC },
            },
          },
        ],
        where: { variant_unit_code },
        group: ["variant_unit_code"],
        raw: true,
      });

      rented.forEach((r) => {
        rentedMap[r.variant_unit_code] = Number(r.total_rented);
      });
    }

    /** ===============================
     * PROCESS VARIANTS
     * =============================== */
    let totalStock = 0;
    let availableStock = 0;
    let selectedVariantAvailable = 0;

    const variants = (unit.variants || []).map((v) => {
      const realQty = v.qty || 0;
      totalStock += realQty;

      let finalQty = realQty;
      let rentedQty = 0;

      // 🔥 LOGIC SAMA PERSIS
      if (useDateFilter && v.variant_unit_code === variant_unit_code) {
        rentedQty = rentedMap[v.variant_unit_code] || 0;
        finalQty = Math.max(realQty - rentedQty, 0);
        selectedVariantAvailable = finalQty;
      }

      availableStock += finalQty;

      return {
        ...v.toJSON(),
        qty: finalQty,
        // rented_qty: rentedQty,
      };
    });

    /** ===============================
     * FINAL STATUS
     * =============================== */
    let finalStatus = unit.status;
    if (useDateFilter) {
      finalStatus = selectedVariantAvailable > 0 ? "Available" : "Unavailable";
    }

    return resSuccess(res, "Daftar unit berhasil diambil", {
      ...unit.toJSON(),
      variants,
      totalStock,
      availableStock,
      status: finalStatus,
    });
  } catch (err) {
    console.error("getCatalogByUnitCode error:", err);
    return resError(res, "Gagal mengambil data unit", err.message, 500);
  }
};

module.exports = {
  getAllUnitCatalog,
  getCatalogByUnitCode,
};
