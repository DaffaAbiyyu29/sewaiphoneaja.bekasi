const { Op, fn, col, literal } = require("sequelize");
const TrnPayment = require("../../models/TrnPayment");
const {
  MstUnit,
  MstCustomer,
  TrnRent,
  TrnDetailRent,
} = require("../../models/Relations");

const getDashboardAdmin = async (req, res) => {
  try {
    let {
      startDate,
      endDate,
      page = 1,
      limit = 5,
      search = "",
      orderBy = "created_at",
      orderDir = "DESC",
    } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    // Penanganan Pagination & Sorting
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;
    const orderDirection = orderDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const startSql = `${startDate} 00:00:00`;
    const endSql = `${endDate} 23:59:59`;
    const dateRangeFilter = { [Op.between]: [startSql, endSql] };

    // Logika Search untuk Recent Orders (Berdasarkan ID atau Status)
    const searchWhere =
      search.trim() !== ""
        ? {
            [Op.and]: [
              { created_at: dateRangeFilter },
              {
                [Op.or]: [
                  { rent_id: { [Op.like]: `%${search}%` } },
                  { status: { [Op.like]: `%${search}%` } },
                ],
              },
            ],
          }
        : { created_at: dateRangeFilter };

    // --- EXECUTE QUERIES ---
    const [
      totalRevenue,
      totalOrders,
      activeCustomersCount,
      availableDevices,
      revenueTrendRaw,
      popularDevicesRaw,
      orderStatusRaw,
      recentOrdersResult, // Menggunakan findAndCountAll untuk pagination
    ] = await Promise.all([
      TrnPayment.sum("total_payment", {
        where: { status: "Paid", payment_date: dateRangeFilter, is_delete: 0 },
      }),
      // total orders in range
      TrnRent.count({ where: { created_at: dateRangeFilter } }),
      // active customers from mst_customer (status = 'Active')
      MstCustomer.count({ where: { status: "Active" } }),
      MstUnit.count({ where: { status: "Available", is_delete: 0 } }),
      TrnPayment.findAll({
        attributes: [
          [fn("YEAR", col("payment_date")), "year"],
          [fn("MONTH", col("payment_date")), "month"],
          [fn("SUM", col("total_payment")), "total"],
        ],
        where: { status: "Paid", payment_date: dateRangeFilter, is_delete: 0 },
        group: [
          fn("YEAR", col("payment_date")),
          fn("MONTH", col("payment_date")),
        ],
        order: [
          [fn("YEAR", col("payment_date")), "ASC"],
          [fn("MONTH", col("payment_date")), "ASC"],
        ],
        raw: true,
      }),
      TrnDetailRent.findAll({
        attributes: [[fn("COUNT", col("trn_detail_rent.detail_id")), "count"]],
        include: [
          {
            model: MstUnit,
            as: "unit",
            attributes: ["unit_name"],
            required: true,
          },
        ],
        group: ["unit.unit_name", "unit.unit_code"],
        order: [[fn("COUNT", col("trn_detail_rent.detail_id")), "DESC"]],
        limit: 6,
      }),
      TrnRent.findAll({
        attributes: ["status", [fn("COUNT", col("rent_id")), "count"]],
        where: { created_at: dateRangeFilter },
        group: ["status"],
        raw: true,
      }),
      // Query dengan Pagination
      TrnRent.findAndCountAll({
        where: searchWhere,
        attributes: [
          ["rent_id", "order_id"],
          [
            literal("(DATEDIFF(end_rent_date, start_rent_date) + 1)"),
            "duration",
          ],
          "invoice_number",
          "total_price",
          "status",
          "created_at",
        ],
        include: [
          { model: MstCustomer, as: "customer", attributes: ["fullname"] },
          {
            model: TrnDetailRent,
            as: "details",
            attributes: ["unit_code"],
            include: [
              { model: MstUnit, as: "unit", attributes: ["unit_name"] },
            ],
          },
        ],
        order: [[orderBy, orderDirection]],
        limit,
        offset,
        distinct: true,
      }),
    ]);

    // Mapping Data
    const formattedRecentOrders = recentOrdersResult.rows.map((order) => ({
      rent_id: order.get("order_id"),
      invoice_number: order.invoice_number,
      customer_name: order.customer?.fullname || "-",
      device_name:
        order.details
          ?.map((d) => d.unit?.unit_name)
          .filter(Boolean)
          .join(", ") || "-",
      duration: order.get("duration"),
      total_price: parseFloat(order.total_price || 0),
      status: order.status,
    }));

    return res.status(200).json({
      filter: { startDate: startSql, endDate: endSql },
      summary: {
        totalRevenue: parseFloat(totalRevenue || 0),
        totalOrders: parseInt(totalOrders || 0),
        activeCustomers: parseInt(activeCustomersCount || 0),
        availableDevices,
      },
      revenueTrend: revenueTrendRaw.map((r) => ({
        year: parseInt(r.year),
        month: parseInt(r.month),
        total: parseFloat(r.total || 0),
      })),
      popularDevices: popularDevicesRaw.map((d) => ({
        name: d.unit?.unit_name || "-",
        count: parseInt(d.get("count") || 0),
      })),
      orderStatus: orderStatusRaw.map((s) => ({
        status: s.status,
        count: parseInt(s.count || 0),
      })),
      recentOrders: {
        data: formattedRecentOrders,
        pagination: {
          totalData: recentOrdersResult.count,
          currentPage: page,
          totalPages: Math.ceil(recentOrdersResult.count / limit),
          pageSize: limit,
        },
      },
    });
  } catch (error) {
    console.error("getDashboardAdmin error:", error);
    return res.status(500).json({ message: "Error", error: error.message });
  }
};

module.exports = { getDashboardAdmin };
