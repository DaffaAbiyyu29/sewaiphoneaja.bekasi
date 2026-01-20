import axios from "axios";
import { getToken } from "./GetToken";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard API
export const getDashboardData = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get("/api/admin/dashboard", {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// Revenue Report API
export const getRevenueReport = async (
  startDate,
  endDate,
  page = 1,
  limit = 10,
  search = "",
  orderBy = "created_at",
  orderDir = "DESC",
) => {
  try {
    const response = await axiosInstance.get("/api/admin/reports/revenue", {
      params: {
        startDate,
        endDate,
        page,
        limit,
        search,
        orderBy,
        orderDir,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue report:", error);
    throw error;
  }
};

// Rental Report API
export const getRentalReport = async (
  startDate,
  endDate,
  page = 1,
  limit = 10,
  search = "",
  orderBy = "created_at",
  orderDir = "DESC",
) => {
  try {
    const response = await axiosInstance.get("/api/admin/reports/rental", {
      params: {
        startDate,
        endDate,
        page,
        limit,
        search,
        orderBy,
        orderDir,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching rental report:", error);
    throw error;
  }
};

// Customer Report API
export const getCustomerReport = async (
  startDate,
  endDate,
  page = 1,
  limit = 10,
  search = "",
  orderBy = "fullname",
  orderDir = "ASC",
) => {
  try {
    const response = await axiosInstance.get("/api/admin/reports/customer", {
      params: {
        startDate,
        endDate,
        page,
        limit,
        search,
        orderBy,
        orderDir,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customer report:", error);
    throw error;
  }
};

// Unit Report API
export const getUnitReport = async (
  startDate,
  endDate,
  page = 1,
  limit = 10,
  search = "",
  orderBy = "unit_name",
  orderDir = "ASC",
) => {
  try {
    const response = await axiosInstance.get("/api/admin/reports/unit", {
      params: {
        startDate,
        endDate,
        page,
        limit,
        search,
        orderBy,
        orderDir,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching unit report:", error);
    throw error;
  }
};

export default {
  getDashboardData,
  getRevenueReport,
  getRentalReport,
  getCustomerReport,
  getUnitReport,
};
