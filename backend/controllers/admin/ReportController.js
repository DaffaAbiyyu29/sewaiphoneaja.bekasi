const { Op, fn, col, where, literal } = require("sequelize");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const TrnPayment = require("../../models/TrnPayment");
const {
  MstUnit,
  MstCustomer,
  TrnRent,
  TrnDetailRent,
} = require("../../models/Relations");

// GET Revenue Report
const getRevenueReport = async (req, res, isExport = false) => {
  try {
    let {
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search = "",
      orderBy = "created_at",
      orderDir = "DESC",
    } = req.query;

    if (!startDate || !endDate) {
      return resError(
        res,
        "startDate and endDate are required",
        "Missing required parameters",
        400,
      );
    }

    // Pagination & Sorting
    page = parseInt(page);
    limit = parseInt(limit);
    const allowedLimits = [10, 25, 50, 100];
    if (!allowedLimits.includes(limit)) limit = 10;

    const offset = (page - 1) * limit;
    const orderDirection = orderDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const startSql = `${startDate} 00:00:00`;
    const endSql = `${endDate} 23:59:59`;
    const dateRangeFilter = { [Op.between]: [startSql, endSql] };

    // Get revenue by month
    const revenueData = await TrnPayment.findAll({
      attributes: [
        [fn("DATE", col("payment_date")), "date"],
        [fn("COUNT", col("payment_id")), "totalTransaksi"],
        [fn("SUM", col("total_payment")), "totalPendapatan"],
        [
          where(
            fn(
              "SUM",
              literal(
                "CASE WHEN status = 'Paid' THEN total_payment ELSE 0 END",
              ),
            ),
            Op.gte,
            0,
          ),
          "lunas",
        ],
        [
          where(
            fn(
              "SUM",
              literal(
                "CASE WHEN status = 'Pending' THEN total_payment ELSE 0 END",
              ),
            ),
            Op.gte,
            0,
          ),
          "pending",
        ],
      ],
      where: {
        payment_date: dateRangeFilter,
        is_delete: 0,
      },
      group: [fn("DATE", col("payment_date"))],
      order: [[fn("DATE", col("payment_date")), "ASC"]],
      subQuery: false,
      raw: true,
    });

    // Map hasil ke format yang sesuai
    const formattedData = revenueData.map((item) => ({
      periode: item.date, // format yyyy-mm-dd
      totalTransaksi: parseInt(item.totalTransaksi) || 0,
      totalPendapatan: parseFloat(item.totalPendapatan) || 0,
      lunas: parseInt(item.lunas) || 0,
      pending: parseInt(item.pending) || 0,
    }));

    // Calculate totals
    const totals = {
      totalTransaksi: formattedData.reduce(
        (sum, item) => sum + item.totalTransaksi,
        0,
      ),
      totalPendapatan: formattedData.reduce(
        (sum, item) => sum + item.totalPendapatan,
        0,
      ),
      lunas: formattedData.reduce((sum, item) => sum + item.lunas, 0),
      pending: formattedData.reduce((sum, item) => sum + item.pending, 0),
    };

    return resSuccess(
      res,
      "Revenue report retrieved successfully",
      formattedData,
      {
        totalData: formattedData.length,
        currentPage: page,
        totalPages: 1,
        pageSize: limit,
      },
    );
  } catch (error) {
    console.error("getRevenueReport error:", error);
    return resError(
      res,
      "Failed to retrieve revenue report",
      error.message,
      500,
    );
  }
};

// GET Rental Report
const getRentalReport = async (req, res, isExport = false) => {
  try {
    let {
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search = "",
      orderBy = "created_at",
      orderDir = "DESC",
    } = req.query;

    if (!startDate || !endDate) {
      return resError(
        res,
        "startDate and endDate are required",
        "Missing required parameters",
        400,
      );
    }

    // Pagination & Sorting
    page = parseInt(page);
    limit = parseInt(limit);
    const allowedLimits = [10, 25, 50, 100];
    if (!allowedLimits.includes(limit)) limit = 10;

    const offset = (page - 1) * limit;
    const orderDirection = orderDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const startSql = `${startDate} 00:00:00`;
    const endSql = `${endDate} 23:59:59`;
    const dateRangeFilter = { [Op.between]: [startSql, endSql] };

    // Search filter
    const searchWhere = {
      start_rent_date: dateRangeFilter,
    };

    if (search.trim() !== "") {
      searchWhere[Op.and].push({
        [Op.or]: [
          { rent_id: { [Op.like]: `%${search}%` } },
          { status: { [Op.like]: `%${search}%` } },
          { invoice_number: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    // Allowed order fields
    const allowedOrderFields = [
      "rent_id",
      "invoice_number",
      "customer_id",
      "start_rent_date",
      "status",
      "total_price",
      "created_at",
    ];
    const orderField = allowedOrderFields.includes(orderBy)
      ? orderBy
      : "created_at";

    // Get rental data with pagination
    const { count, rows } = await TrnRent.findAndCountAll({
      where: searchWhere,
      attributes: [
        "rent_id",
        "invoice_number",
        "start_rent_date",
        "end_rent_date",
        "status",
        "total_price",
      ],
      include: [
        {
          model: MstCustomer,
          as: "customer",
          attributes: ["fullname"],
          required: false,
        },
        {
          model: TrnDetailRent,
          as: "details",
          attributes: ["unit_code"],
          include: [
            {
              model: MstUnit,
              as: "unit",
              attributes: ["unit_name", "brand"],
              required: false,
            },
          ],
          required: false,
        },
      ],
      order: [[orderField, orderDirection]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    // Format data
    const formattedData = rows.map((rental) => {
      const startDate = new Date(rental.start_rent_date);
      const endDate = new Date(rental.end_rent_date);
      const periode = `${startDate.getDate()}-${endDate.getDate()} ${getMonthName(endDate.getMonth() + 1)} ${endDate.getFullYear()}`;

      return {
        rentId: rental.rent_id,
        invoiceNumber: rental.invoice_number,
        customer: rental.customer?.fullname || "-",
        unit:
          rental.details
            ?.map((d) =>
              `${d.unit?.unit_name || ""} ${d.unit?.brand || ""}`.trim(),
            )
            .join(", ") || "-",
        periode,
        status: rental.status,
        total: parseFloat(rental.total_price || 0),
      };
    });

    const totalPages = Math.ceil(count / limit);

    return resSuccess(
      res,
      "Rental report retrieved successfully",
      formattedData,
      {
        totalData: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    );
  } catch (error) {
    console.error("getRentalReport error:", error);
    return resError(
      res,
      "Failed to retrieve rental report",
      error.message,
      500,
    );
  }
};

// GET Customer Report

const getCustomerReport = async (req, res, isExport = false) => {
  try {
    let {
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search = "",
      orderBy = "fullname",
      orderDir = "ASC",
    } = req.query;

    // ================= VALIDATION =================
    if (!startDate || !endDate) {
      return resError(
        res,
        "startDate and endDate are required",
        "Missing required parameters",
        400,
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const allowedLimits = [10, 25, 50, 100];
    if (!allowedLimits.includes(limit)) limit = 10;

    const offset = (page - 1) * limit;
    const orderDirection = orderDir.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const startSql = `${startDate} 00:00:00`;
    const endSql = `${endDate} 23:59:59`;

    // ================= SEARCH =================
    const dateFilter = {
      [Op.and]: [
        where(fn("DATE", col("created_at")), {
          [Op.between]: [startSql, endSql],
        }),
      ],
    };

    const searchWhere =
      search.trim() !== ""
        ? {
            [Op.or]: [
              { customer_id: { [Op.like]: `%${search}%` } },
              { fullname: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
              { telp: { [Op.like]: `%${search}%` } },
            ],
          }
        : {};

    const finalWhere = {
      ...searchWhere,
      ...dateFilter,
    };

    // ================= SORT =================
    const allowedOrderFields = [
      "customer_id",
      "fullname",
      "created_at",
      "totalRental",
      "totalSpent",
      "lastRental",
    ];

    const orderField = allowedOrderFields.includes(orderBy)
      ? orderBy
      : "fullname";

    const orderClause = ["customer_id", "fullname", "created_at"].includes(
      orderField,
    )
      ? col(orderField)
      : literal(orderField);

    // ================= QUERY =================
    const { count, rows } = await MstCustomer.findAndCountAll({
      where: finalWhere,
      attributes: [
        "customer_id",
        "fullname",
        "telp",
        "email",
        "status",

        // TOTAL RENTAL
        [
          literal(`
            (
              SELECT COUNT(DISTINCT r.rent_id)
              FROM trn_rent r
              WHERE r.customer_id = mst_customer.customer_id
              AND r.start_rent_date BETWEEN '${startSql}' AND '${endSql}'
              AND r.status NOT IN ('Cancelled', 'Invalid')
            )
          `),
          "totalRental",
        ],

        // TOTAL SPENT (REAL PAYMENT)
        [
          literal(`
            (
              SELECT COALESCE(SUM(p.total_payment), 0)
              FROM trn_payment p
              INNER JOIN trn_rent r ON r.rent_id = p.rent_id
              WHERE r.customer_id = mst_customer.customer_id
              AND p.status = 'Paid'
              AND p.is_delete = 0
              AND p.payment_date BETWEEN '${startSql}' AND '${endSql}'
            )
          `),
          "totalSpent",
        ],

        // LAST RENTAL (GLOBAL)
        [
          literal(`
            (
              SELECT MAX(r.start_rent_date)
              FROM trn_rent r
              WHERE r.customer_id = mst_customer.customer_id
              AND r.status NOT IN ('Cancelled', 'Invalid')
            )
          `),
          "lastRental",
        ],
      ],
      order: [[orderClause, orderDirection]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
      raw: true,
    });

    // ================= FORMAT RESPONSE =================
    const formattedData = rows.map((row) => ({
      customerId: row.customer_id,
      name: row.fullname,
      email: row.email ?? "",
      phone: row.telp ?? "",
      status: row.status ?? "Active",
      totalRental: Number(row.totalRental) || 0,
      totalSpent: Number(row.totalSpent) || 0,
      lastRental: row.lastRental,
    }));

    const totalPages = Math.ceil(count / limit);

    return resSuccess(
      res,
      "Customer report retrieved successfully",
      formattedData,
      {
        totalData: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    );
  } catch (error) {
    console.error("getCustomerReport error:", error);
    return resError(
      res,
      "Failed to retrieve customer report",
      error.message,
      500,
    );
  }
};

// GET Unit Report
const getUnitReport = async (req, res, isExport = false) => {
  try {
    let {
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search = "",
      orderBy = "unit_name",
      orderDir = "ASC",
    } = req.query;

    if (!startDate || !endDate) {
      return resError(
        res,
        "startDate and endDate are required",
        "Missing required parameters",
        400,
      );
    }

    // Pagination & Sorting
    page = parseInt(page);
    limit = parseInt(limit);
    const allowedLimits = [10, 25, 50, 100];
    if (!allowedLimits.includes(limit)) limit = 10;

    const offset = (page - 1) * limit;
    const orderDirection = orderDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const startSql = `${startDate} 00:00:00`;
    const endSql = `${endDate} 23:59:59`;
    const dateRangeFilter = { [Op.between]: [startSql, endSql] };

    // Search filter
    const searchWhere =
      search.trim() !== ""
        ? {
            [Op.or]: [
              { unit_code: { [Op.like]: `%${search}%` } },
              { unit_name: { [Op.like]: `%${search}%` } },
            ],
          }
        : {};

    // Allowed order fields
    const allowedOrderFields = ["unit_code", "unit_name", "created_at"];
    const orderField = allowedOrderFields.includes(orderBy)
      ? orderBy
      : "unit_name";

    // Get unit performance data
    const { count, rows } = await MstUnit.findAndCountAll({
      where: {
        ...searchWhere,
        is_delete: 0,
        [Op.and]: where(fn("DATE", col("created_at")), dateRangeFilter),
      },
      attributes: [
        "unit_code",
        "unit_name",
        // total rentals for the period
        [
          literal(
            `(SELECT COUNT(DISTINCT detail_id) FROM trn_detail_rent WHERE unit_code = mst_unit.unit_code AND created_at BETWEEN '${startSql}' AND '${endSql}')`,
          ),
          "totalRental",
        ],
        // revenue generated by this unit in the period
        [
          literal(
            `(SELECT SUM(total_price) FROM trn_rent WHERE rent_id IN (SELECT DISTINCT rent_id FROM trn_detail_rent WHERE unit_code = mst_unit.unit_code AND created_at BETWEEN '${startSql}' AND '${endSql}'))`,
          ),
          "revenue",
        ],
        // active price per day (take first active price if multiple)
        [
          literal(
            `(SELECT price_per_day FROM mst_price_unit WHERE unit_code = mst_unit.unit_code AND status = 'Active' ORDER BY duration ASC LIMIT 1)`,
          ),
          "pricePerDay",
        ],
        // brand from mst_unit already exists in model, but include explicitly
        "brand",
        // variant counts
        [
          literal(
            `(SELECT COUNT(*) FROM mst_variant_unit WHERE unit_code = mst_unit.unit_code AND is_delete = 0)`,
          ),
          "totalVariants",
        ],
        // total available qty across variants
        [
          literal(
            `(SELECT COALESCE(SUM(qty),0) FROM mst_variant_unit WHERE unit_code = mst_unit.unit_code AND status = 'Available')`,
          ),
          "totalAvailable",
        ],
      ],
      order: [[orderField, orderDirection]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
      raw: true,
    });

    // Calculate utilization
    const formattedData = rows.map((unit) => {
      const totalRental = parseInt(unit.totalRental) || 0;
      const days = Math.ceil(
        (new Date(endSql) - new Date(startSql)) / (1000 * 60 * 60 * 24),
      );
      // const utilization =
      //   days > 0 ? ((totalRental / days) * 100).toFixed(2) : "0";

      return {
        unitCode: unit.unit_code,
        unitName: unit.unit_name,
        brand: unit.brand || null,
        pricePerDay: unit.pricePerDay ? parseFloat(unit.pricePerDay) : 0,
        totalVariants: parseInt(unit.totalVariants) || 0,
        totalAvailable: parseInt(unit.totalAvailable) || 0,
        totalRental,
        revenue: parseFloat(unit.revenue) || 0,
        // utilization: `${utilization}%`,
      };
    });

    const totalPages = Math.ceil(count / limit);

    return resSuccess(
      res,
      "Unit report retrieved successfully",
      formattedData,
      {
        totalData: count,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    );
  } catch (error) {
    console.error("getUnitReport error:", error);
    return resError(res, "Failed to retrieve unit report", error.message, 500);
  }
};

// Helper function to get month name
const getMonthName = (monthNumber) => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[monthNumber - 1] || "";
};

module.exports = {
  getRevenueReport,
  getRentalReport,
  getCustomerReport,
  getUnitReport,
};

// Unified report endpoint dispatcher
const getReport = async (req, res) => {
  const type = (req.query.type || "").toLowerCase();
  if (type === "revenue") return getRevenueReport(req, res);
  if (type === "rental") return getRentalReport(req, res);
  if (type === "customer") return getCustomerReport(req, res);
  if (type === "unit") return getUnitReport(req, res);
  return resError(
    res,
    "Invalid report type",
    "type must be one of: revenue,rental,customer,unit",
    400,
  );
};

module.exports.getReport = getReport;
