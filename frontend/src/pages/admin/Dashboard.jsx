"use client";

import {
  faBoxesPacking,
  faCalendar,
  faDollarSign,
  faFilter,
  faMobileScreen,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RecentRentalColumns } from "../../columns/RecentRental";
import Datatable from "../../components/Datatable";

export default function Dashboard() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return getWIBDate(firstDay);
  });

  const [endDate, setEndDate] = useState(() => {
    return getWIBDate(new Date());
  });

  function getWIBDate(date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  const fetchDashboardData = async (start, end) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/dashboard`, {
        params:
          start && end
            ? {
                startDate: start,
                endDate: end,
              }
            : {},
      });

      setData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(startDate, endDate);
  }, [startDate, endDate]);

  const handleFilter = () => {
    if (startDate && endDate) {
      fetchDashboardData(startDate, endDate);
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchDashboardData(startDate, endDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Memuat Data...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const revenueTrend = data.revenueTrend.map((item) => ({
    name: `${item.month}/${item.year}`,
    revenue: item.total,
  }));

  const orderStatusData = data.orderStatus.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  const COLORS = {
    Open: "#3b82f6",
    Close: "#10b981",
    "Waiting Payment": "#f59e0b",
    Cancelled: "#ef4444",
  };

  const stats = [
    {
      title: "Total Pendapatan",
      value: `Rp${data.summary.totalRevenue.toLocaleString()}`,
      icon: faDollarSign,
      color: "bg-emerald-500",
    },
    {
      title: "Total Pesanan",
      value: data.summary.totalOrders,
      icon: faBoxesPacking,
      color: "bg-blue-600",
    },
    {
      title: "Customer Aktif",
      value: data.summary.activeCustomers,
      icon: faUsers,
      color: "bg-purple-600",
    },
    {
      title: "Device Tersedia",
      value: data.summary.availableDevices,
      icon: faMobileScreen,
      color: "bg-orange-500",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-blue-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <p className="text-blue-600 font-bold text-lg">
            Rp{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto">
        {/* Header & Filter */}
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
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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

        {/* Stats Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-2 border-gray-200 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-4 rounded-xl shadow-md`}>
                  <FontAwesomeIcon
                    icon={stat.icon}
                    className="w-6 h-6 text-white"
                  />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-semibold mb-2">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Trend Pendapatan
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontSize: "12px", fontWeight: "500" }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "12px", fontWeight: "500" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Popular Devices */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Device Populer
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.popularDevices}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontSize: "12px", fontWeight: "500" }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "12px", fontWeight: "500" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#0d69e0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Order Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-2 border-gray-200">
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1 h-5 md:h-6 bg-blue-600 rounded-full"></span>
              Status Pesanan
            </h3>

            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) =>
                    window.innerWidth >= 768 ? `${name}: ${value}` : value
                  }
                  labelLine={false}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-2 border-gray-200 lg:col-span-2">
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1 h-5 md:h-6 bg-blue-500 rounded-full"></span>
              Pesanan Terbaru
            </h3>

            {/* Table scroll horizontal di mobile */}
            <div className="overflow-x-auto">
              <Datatable
                dataValue={data.recentOrders}
                columns={RecentRentalColumns()}
                allowAdd={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
