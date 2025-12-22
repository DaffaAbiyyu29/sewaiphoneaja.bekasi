const { QueryTypes } = require("sequelize");
const sequelize = require("../../models/index");
const TrnRent = require("../../models/TrnRental");
const TrnPayment = require("../../models/TrnPayment");
const MstUnit = require("../../models/MstUnit");

/**
 * GET /admin/dashboard
 * Query params (optional):
 * - startDate
 * - endDate
 * Format: YYYY-MM-DD
 */
const getDashboardAdmin = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // helper validasi format YYYY-MM-DD
    const isYMD = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

    // default start = 7 bulan terakhir (tanggal 1) format YYYY-MM-DD
    const defaultStartObj = new Date();
    defaultStartObj.setMonth(defaultStartObj.getMonth() - 6);
    defaultStartObj.setDate(1);

    const defaultStartYMD = [
      defaultStartObj.getFullYear(),
      String(defaultStartObj.getMonth() + 1).padStart(2, "0"),
      String(defaultStartObj.getDate()).padStart(2, "0"),
    ].join("-");

    // default end = hari ini format YYYY-MM-DD
    const now = new Date();
    const defaultEndYMD = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    // pakai STRING tanggal langsung (hindari timezone shift)
    const startYMD = isYMD(startDate) ? startDate : defaultStartYMD;
    const endYMD = isYMD(endDate) ? endDate : defaultEndYMD;

    // validasi urutan tanggal (string YYYY-MM-DD aman dibandingkan)
    if (startYMD > endYMD) {
      return res
        .status(400)
        .json({ message: "startDate must be before endDate" });
    }

    // final SQL datetime untuk BETWEEN
    const startSql = `${startYMD} 00:00:00`;
    const endSql = `${endYMD} 23:59:59`;

    // 1) Total Pendapatan (Paid) dalam range
    const totalRevenue = await TrnPayment.sum("total_payment", {
      where: { status: "Paid" },
      // kalau model TrnPayment punya created_at / payment_date di field payment_date:
      // kita pakai raw query di bawah agar pasti sesuai kolom payment_date
    });

    // Lebih aman: hitung totalRevenue pakai SQL payment_date
    const totalRevenueRaw = await sequelize.query(
      `SELECT COALESCE(SUM(total_payment),0) AS total
       FROM trn_payment
       WHERE status='Paid'
         AND payment_date BETWEEN :startDate AND :endDate`,
      {
        replacements: { startDate: startSql, endDate: endSql },
        type: QueryTypes.SELECT,
      }
    );

    const totalRevenueInRange = parseFloat(totalRevenueRaw?.[0]?.total || 0);

    // 2) Total Pesanan (rent) dalam range (pakai created_at)
    const totalOrdersRaw = await sequelize.query(
      `SELECT COUNT(*) AS total
       FROM trn_rent
       WHERE created_at BETWEEN :startDate AND :endDate`,
      {
        replacements: { startDate: startSql, endDate: endSql },
        type: QueryTypes.SELECT,
      }
    );
    const totalOrders = parseInt(totalOrdersRaw?.[0]?.total || 0, 10);

    // 3) Customer Aktif (distinct customer_id) dalam range
    const activeCustomersRaw = await sequelize.query(
      `SELECT COUNT(DISTINCT customer_id) AS total
       FROM trn_rent
       WHERE created_at BETWEEN :startDate AND :endDate`,
      {
        replacements: { startDate: startSql, endDate: endSql },
        type: QueryTypes.SELECT,
      }
    );
    const activeCustomers = parseInt(activeCustomersRaw?.[0]?.total || 0, 10);

    // 4) Device Tersedia (tidak perlu range)
    const availableDevices = await MstUnit.count({
      where: { status: "Available" },
    });

    // 5) Trend Pendapatan (per bulan) dalam range
    const revenueTrendRaw = await sequelize.query(
      `SELECT YEAR(payment_date) AS year,
              MONTH(payment_date) AS month,
              SUM(total_payment) AS total
       FROM trn_payment
       WHERE status='Paid'
         AND payment_date BETWEEN :startDate AND :endDate
       GROUP BY YEAR(payment_date), MONTH(payment_date)
       ORDER BY YEAR(payment_date), MONTH(payment_date)`,
      {
        replacements: { startDate: startSql, endDate: endSql },
        type: QueryTypes.SELECT,
      }
    );

    const revenueTrend = revenueTrendRaw.map((r) => ({
      year: r.year,
      month: r.month,
      total: parseFloat(r.total) || 0,
    }));

    // 6) Device Paling Populer (top 6) dalam range (filter trn_rent.created_at)
    const popularDevicesRaw = await sequelize.query(
      `SELECT u.unit_name AS name, COUNT(d.detail_id) AS count
       FROM trn_detail_rent d
       LEFT JOIN mst_unit u ON u.unit_code = d.unit_code
       LEFT JOIN trn_rent r ON r.rent_id = d.rent_id
       WHERE r.created_at BETWEEN :startDate AND :endDate
       GROUP BY u.unit_name
       ORDER BY COUNT(d.detail_id) DESC
       LIMIT 6`,
      {
        replacements: { startDate: startSql, endDate: endSql },
        type: QueryTypes.SELECT,
      }
    );

    const popularDevices = popularDevicesRaw.map((r) => ({
      name: r.name,
      count: parseInt(r.count, 10) || 0,
    }));

    // 7) Status Pesanan dalam range
    const orderStatusRaw = await sequelize.query(
      `SELECT status, COUNT(*) AS count
       FROM trn_rent
       WHERE created_at BETWEEN :startDate AND :endDate
       GROUP BY status`,
      {
        replacements: { startDate: startSql, endDate: endSql },
        type: QueryTypes.SELECT,
      }
    );

    const orderStatus = orderStatusRaw.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10) || 0,
    }));

    // 8) Pesanan Terbaru (5) dalam range
    const recentOrdersRaw = await sequelize.query(
      `SELECT r.rent_id AS order_id,
              COALESCE(c.fullname, '-') AS customer_name,
              GROUP_CONCAT(DISTINCT u.unit_name SEPARATOR ', ') AS device_name,
              (DATEDIFF(r.end_rent_date, r.start_rent_date) + 1) AS duration,
              r.total_price AS total_price,
              r.status
       FROM trn_rent r
       LEFT JOIN mst_customer c ON c.customer_id = r.customer_id
       LEFT JOIN trn_detail_rent d ON d.rent_id = r.rent_id
       LEFT JOIN mst_unit u ON u.unit_code = d.unit_code
       WHERE r.created_at BETWEEN :startDate AND :endDate
       GROUP BY r.rent_id
       ORDER BY r.created_at DESC
       LIMIT 5`,
      {
        replacements: { startDate: startSql, endDate: endSql },
        type: QueryTypes.SELECT,
      }
    );

    const recentOrders = recentOrdersRaw.map((r) => ({
      order_id: r.order_id,
      customer_name: r.customer_name,
      device_name: r.device_name || "-",
      duration: r.duration != null ? parseInt(r.duration, 10) : null,
      total_price: parseFloat(r.total_price) || 0,
      status: r.status,
    }));

    return res.status(200).json({
      filter: { startDate: startSql, endDate: endSql },
      summary: {
        totalRevenue: totalRevenueInRange,
        totalOrders,
        activeCustomers,
        availableDevices: parseInt(availableDevices, 10) || 0,
      },
      revenueTrend,
      popularDevices,
      orderStatus,
      recentOrders,
    });
  } catch (error) {
    console.error("getDashboardAdmin error:", error);
    return res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = { getDashboardAdmin };
