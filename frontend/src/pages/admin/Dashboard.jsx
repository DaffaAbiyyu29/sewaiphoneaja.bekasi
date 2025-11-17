"use client";

import React from "react";
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
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faBoxesPacking,
  faUsers,
  faMobileScreen,
} from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
  // Revenue trend data
  const revenueData = [
    { month: "Jan", revenue: 45000000 },
    { month: "Feb", revenue: 52000000 },
    { month: "Mar", revenue: 48000000 },
    { month: "Apr", revenue: 61000000 },
    { month: "Mei", revenue: 55000000 },
    { month: "Jun", revenue: 67000000 },
    { month: "Jul", revenue: 72000000 },
  ];

  // Popular devices data
  const deviceData = [
    { name: "iPhone 15 Pro Max", orders: 145 },
    { name: "iPhone 15 Pro", orders: 132 },
    { name: "iPhone 14 Pro", orders: 98 },
    { name: "iPhone 15", orders: 87 },
    { name: "iPhone 14", orders: 76 },
    { name: "iPhone 13", orders: 54 },
  ];

  // Order status pie chart
  const statusData = [
    { name: "Aktif", value: 245, color: "#3b82f6" },
    { name: "Selesai", value: 189, color: "#10b981" },
    { name: "Pending", value: 67, color: "#f59e0b" },
    { name: "Dibatalkan", value: 23, color: "#ef4444" },
  ];

  // Recent orders
  const recentOrders = [
    {
      id: "#ORD-1234",
      customer: "Budi Santoso",
      device: "iPhone 15 Pro Max",
      duration: "7 hari",
      amount: "Rp1.050.000",
      status: "Aktif",
    },
    {
      id: "#ORD-1233",
      customer: "Siti Nurhaliza",
      device: "iPhone 15 Pro",
      duration: "14 hari",
      amount: "Rp1.820.000",
      status: "Aktif",
    },
    {
      id: "#ORD-1232",
      customer: "Andi Wijaya",
      device: "iPhone 14 Pro",
      duration: "30 hari",
      amount: "Rp3.600.000",
      status: "Pending",
    },
    {
      id: "#ORD-1231",
      customer: "Dewi Lestari",
      device: "iPhone 15",
      duration: "7 hari",
      amount: "Rp700.000",
      status: "Selesai",
    },
    {
      id: "#ORD-1230",
      customer: "Rudi Hermawan",
      device: "iPhone 14",
      duration: "3 hari",
      amount: "Rp255.000",
      status: "Aktif",
    },
  ];

  const stats = [
    {
      title: "Total Revenue",
      value: "Rp72.5 Juta",
      change: "+12.5%",
      icon: faDollarSign,
      color: "bg-green-500",
    },
    {
      title: "Total Pesanan",
      value: "524",
      change: "+8.2%",
      icon: faBoxesPacking,
      color: "bg-blue-500",
    },
    {
      title: "Customer Aktif",
      value: "342",
      change: "+15.3%",
      icon: faUsers,
      color: "bg-purple-500",
    },
    {
      title: "Device Tersedia",
      value: "87",
      change: "-5.1%",
      icon: faMobileScreen,
      color: "bg-orange-500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Aktif":
        return "bg-blue-100 text-blue-700";
      case "Selesai":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Admin
          </h1>
          <p className="text-gray-600">
            Selamat datang kembali! Berikut ringkasan bisnis Anda hari ini.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <FontAwesomeIcon
                    icon={stat.icon}
                    className="w-6 h-6 text-white"
                  />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Trend Pendapatan (7 Bulan Terakhir)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000000}Jt`} />
                <Tooltip
                  formatter={(value) =>
                    `Rp${(value / 1000000).toFixed(1)} Juta`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Popular Devices Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Device Paling Populer
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Status Pie */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Status Pesanan
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Pesanan Terbaru
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Customer
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Device
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Durasi
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Total
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {order.customer}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {order.device}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {order.duration}
                      </td>
                      <td className="py-3 px-2 text-sm font-semibold text-gray-900">
                        {order.amount}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
