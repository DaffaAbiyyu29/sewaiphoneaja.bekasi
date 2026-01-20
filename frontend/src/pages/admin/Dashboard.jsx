import { faCalendar, faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import {
  AlertCircle,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RecentRentalColumns } from "../../columns/RecentRental";
import Datatable from "../../components/shared/Datatable";
import { Loader } from "../../components/shared/Loader";
import { formatCurrency } from "../../helpers/Format";

export const getWIBDate = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize default period: first day of month -> today (WIB)
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return getWIBDate(firstDay);
  });

  const [endDate, setEndDate] = useState(() => getWIBDate(new Date()));

  const fetchDashboardData = async (start, end) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = start && end ? { startDate: start, endDate: end } : {};

      const response = await axios.get(`${API_URL}/api/admin/dashboard`, {
        params,
        headers,
      });

      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  useEffect(() => {
    // Fetch initial data for default period
    fetchDashboardData(startDate, endDate);
  }, []);

  const handleFilter = () => {
    if (startDate && endDate) fetchDashboardData(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchDashboardData();
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-red-600 text-center py-4">{error}</div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const revenueTrend = dashboardData?.revenueTrend || [];
  const orderStatus = dashboardData?.orderStatus || [];
  const popularDevices = dashboardData?.popularDevices || [];

  // Map order status data untuk pie chart
  const statusColorMap = {
    Open: "#3b82f6",
    "Waiting Payment": "#f59e0b",
    Close: "#10b981",
    Cancelled: "#ef4444",
  };

  const rentalStatusData = orderStatus.map((item) => ({
    name: item.status,
    value: item.count,
    color: statusColorMap[item.status] || "#9ca3af",
  }));

  const stats = [
    {
      key: "revenue",
      title: "Total Pendapatan",
      value: formatCurrency(summary.totalRevenue || 0),
      icon: <DollarSign className="text-green-600" size={24} />,
      color: "bg-green-100",
    },
    {
      key: "orders",
      title: "Total Pesanan",
      value: (summary.totalOrders || 0).toString(),
      icon: <TrendingUp className="text-blue-600" size={24} />,
      color: "bg-blue-100",
    },
    {
      key: "devices",
      title: "Device Tersedia",
      value: (summary.availableDevices || 0).toString(),
      icon: <Package className="text-purple-600" size={24} />,
      color: "bg-purple-100",
    },
    {
      key: "customers",
      title: "Total Customer",
      value: (summary.activeCustomers || 0).toString(),
      icon: <Users className="text-orange-600" size={24} />,
      color: "bg-orange-100",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faFilter} className="text-blue-600" />
            <h3 className="font-bold text-gray-800">Filter Periode</h3>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="mr-2 text-blue-600"
                />
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="mr-2 text-blue-600"
                />
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFilter}
                disabled={!startDate || !endDate}
                className="px-6 py-2.5 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                Terapkan Filter
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all shadow-md"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 border-2 border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`${stat.color} p-3 rounded-xl shadow-md flex items-center justify-center w-12 h-12`}
              >
                {stat.icon}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              {stat.title}
            </h3>
            <p className="text-3xl font-extrabold text-gray-900 truncate">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Rental Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <Datatable
              isCard={false}
              isSearch={false}
              dataValue={{
                data: dashboardData?.recentOrders?.data?.slice(0, 5) || [],
                pagination: {
                  totalPages: 1,
                  totalData: dashboardData?.recentOrders?.data?.length || 0,
                },
              }}
              columns={RecentRentalColumns()}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={revenueTrend.map((item) => ({
                  month: `${item.month}/${item.year}`,
                  revenue: item.total,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Status Rental</h2>
          {rentalStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={rentalStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rentalStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Top Units & Unit Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Unit Paling Populer</h2>
          {popularDevices.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={popularDevices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Ketersediaan Unit</h2>
          <div className="space-y-4">
            {popularDevices.length > 0 ? (
              popularDevices.map((unit, idx) => {
                const total = unit.count + (unit.rented || 0);
                const percentage =
                  total > 0 ? ((unit.count / total) * 100).toFixed(0) : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{unit.name}</span>
                      <span className="text-sm text-gray-600">
                        {unit.count}/{total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                No data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
