const { QueryTypes } = require("sequelize");
const sequelize = require("../../models/index");
const TrnRent = require("../../models/TrnRental");
const TrnPayment = require("../../models/TrnPayment");
const TrnDetailRent = require("../../models/TrnDetailRental");
const MstUnit = require("../../models/MstUnit");
const MstCustomer = require("../../models/MstCustomer");

/**
 * GET /admin/dashboard
 * Return dashboard data for admin UI
 */
const getDashboardAdmin = async (req, res) => {
	try {
		// 1. Total Pendapatan (only Paid)
		const totalRevenue = await TrnPayment.sum("total_payment", {
			where: { status: "Paid" },
		});

		// 2. Total Pesanan
		const totalOrders = await TrnRent.count();

		// 3. Customer Aktif (distinct customers in rentals)
		const activeCustomers = await TrnRent.count({
			distinct: true,
			col: "customer_id",
		});

		// 4. Device Tersedia
		const availableDevices = await MstUnit.count({
			where: { status: "Available" },
		});

		// 5. Trend Pendapatan (7 bulan terakhir)
		const sevenMonthsAgo = new Date();
		sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
		sevenMonthsAgo.setDate(1);

		const revenueTrendRaw = await sequelize.query(
			`SELECT YEAR(payment_date) AS year, MONTH(payment_date) AS month, SUM(total_payment) AS total
			 FROM trn_payment
			 WHERE status = 'Paid' AND payment_date >= :startDate
			 GROUP BY YEAR(payment_date), MONTH(payment_date)
			 ORDER BY YEAR(payment_date), MONTH(payment_date)`,
			{
				replacements: { startDate: sevenMonthsAgo.toISOString().slice(0, 19).replace("T", " ") },
				type: QueryTypes.SELECT,
			}
		);

		// Map to array with label (e.g., 2025-07) and total value
		const revenueTrend = revenueTrendRaw.map((r) => ({
			year: r.year,
			month: r.month,
			total: parseFloat(r.total) || 0,
		}));

		// 6. Device Paling Populer (top 6)
		const popularDevicesRaw = await sequelize.query(
			`SELECT u.unit_name AS name, COUNT(d.detail_id) AS count
			 FROM trn_detail_rent d
			 LEFT JOIN mst_unit u ON u.unit_code = d.unit_code
			 GROUP BY u.unit_name
			 ORDER BY COUNT(d.detail_id) DESC
			 LIMIT 6`,
			{ type: QueryTypes.SELECT }
		);

		const popularDevices = popularDevicesRaw.map((r) => ({ name: r.name, count: parseInt(r.count, 10) }));

		// 7. Status Pesanan
		const orderStatusRaw = await sequelize.query(
			`SELECT status, COUNT(*) AS count FROM trn_rent GROUP BY status`,
			{ type: QueryTypes.SELECT }
		);

		const orderStatus = orderStatusRaw.map((r) => ({ status: r.status, count: parseInt(r.count, 10) }));

		// 8. Pesanan Terbaru (5)
		const recentOrdersRaw = await sequelize.query(
			`SELECT r.rent_id AS order_id, COALESCE(c.fullname, '-') AS customer_name,
							GROUP_CONCAT(DISTINCT u.unit_name SEPARATOR ', ') AS device_name,
							DATEDIFF(r.end_rent_date, r.start_rent_date) AS duration,
							r.total_price AS total_price, r.status
			 FROM trn_rent r
			 LEFT JOIN mst_customer c ON c.customer_id = r.customer_id
			 LEFT JOIN trn_detail_rent d ON d.rent_id = r.rent_id
			 LEFT JOIN mst_unit u ON u.unit_code = d.unit_code
			 GROUP BY r.rent_id
			 ORDER BY r.created_at DESC
			 LIMIT 5`,
			{ type: QueryTypes.SELECT }
		);

		const recentOrders = recentOrdersRaw.map((r) => ({
			order_id: r.order_id,
			customer_name: r.customer_name,
			device_name: r.device_name || "-",
			duration: r.duration != null ? parseInt(r.duration, 10) : null,
			total_price: parseFloat(r.total_price) || 0,
			status: r.status,
		}));

		const response = {
			summary: {
				totalRevenue: parseFloat(totalRevenue) || 0,
				totalOrders: parseInt(totalOrders, 10) || 0,
				activeCustomers: parseInt(activeCustomers, 10) || 0,
				availableDevices: parseInt(availableDevices, 10) || 0,
			},
			revenueTrend,
			popularDevices,
			orderStatus,
			recentOrders,
		};

		return res.status(200).json(response);
	} catch (error) {
		console.error("getDashboardAdmin error:", error);
		return res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
	}
};

module.exports = { getDashboardAdmin };

