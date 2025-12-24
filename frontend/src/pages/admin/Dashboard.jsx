"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faBoxesPacking,
  faUsers,
  faMobileScreen,
  faArrowUp,
  faArrowDown,
  faCalendar,
  faFilter,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

// Komponen DataTable Modern
const DataTable = ({ data, columns }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 5;

  // Karena data.recentOrders sekarang { data: [], pagination: {} }
  // Kita ambil array aslinya atau default ke array kosong
  const safeData = Array.isArray(data?.data) ? data.data : [];

  const sortedData = React.useMemo(() => {
    let sortableData = [...safeData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [safeData, sortConfig]);

  const filteredData = sortedData.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <span className="font-medium">Total:</span>
          <span className="font-bold text-blue-600">{filteredData.length}</span>
          <span>data</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead className="bg-blue-600">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    onClick={() => col.accessor && requestSort(col.accessor)}
                    className={`py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider ${
                      col.accessor ? "cursor-pointer hover:bg-blue-700" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {sortConfig.key === col.accessor && (
                        <span className="text-white">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-blue-50 transition-all duration-200 group"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="py-4 px-6 text-sm text-gray-800"
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {paginatedData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">Tidak ada pesanan ditemukan</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold">{startIndex + 1}</span>{" "}
            -
            <span className="font-semibold">
              {" "}
              {Math.min(startIndex + itemsPerPage, filteredData.length)}
            </span>{" "}
            dari
            <span className="font-semibold"> {filteredData.length}</span> data
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    currentPage === idx + 1
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-500"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    // Set ke tanggal 1 di bulan berjalan
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return getWIBDate(firstDay); // Hasil: "2025-12-01"
  });

  const [endDate, setEndDate] = useState(() => {
    return getWIBDate(new Date()); // Hasil: "2025-12-24" (WIB)
  });

  function getWIBDate(date) {
    // Gunakan Intl.DateTimeFormat untuk memaksa zona waktu Asia/Jakarta
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

      console.log(response.data);

      // PENTING: pastiin yang di-set itu ARRAY
      setData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setData([]); // biar ga crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(startDate, endDate);
  }, []);

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
    Pending: "#f59e0b",
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

  const orderColumns = [
    {
      header: "ID Order",
      accessor: "order_id",
      render: (row) => (
        <span className="font-bold text-blue-600">#{row.order_id}</span>
      ),
    },
    {
      header: "Customer",
      accessor: "customer_name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {row.customer_name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{row.customer_name}</span>
        </div>
      ),
    },
    {
      header: "Device",
      accessor: "device_name",
      render: (row) => (
        <span className="text-gray-700 font-medium">{row.device_name}</span>
      ),
    },
    {
      header: "Durasi",
      accessor: "duration",
      render: (row) => (
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {row.duration} hari
        </span>
      ),
    },
    {
      header: "Total",
      accessor: "total_price",
      render: (row) => (
        <span className="font-bold text-emerald-600 text-base">
          Rp{row.total_price.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const statusColors = {
          Open: "bg-blue-100 text-blue-700 border-blue-300",
          Close: "bg-emerald-100 text-emerald-700 border-emerald-300",
          Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
          Cancelled: "bg-red-100 text-red-700 border-red-300",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
              statusColors[row.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {row.status}
          </span>
        );
      },
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
              <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
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
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
              Status Pesanan
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 md:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              Pesanan Terbaru
            </h3>
            <DataTable data={data.recentOrders} columns={orderColumns} />
          </div>
        </div>
      </div>
    </div>
  );
}
