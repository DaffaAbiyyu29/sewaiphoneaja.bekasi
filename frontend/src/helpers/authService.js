import jwtDecode from "jwt-decode";
import { getToken } from "./GetToken";

// ===== PUBLIC ROUTES (TANPA LOGIN) =====
export const PUBLIC_ROUTES = ["/", "/unit", "/pesanan", "/rent-form"];

// Role constants
export const ROLES = {
  MANAGER: "Manager",
  SUPERVISOR: "Supervisor",
  ADMIN: "Admin",
};

// ===== ROLE PERMISSIONS MAPPING =====
const ROLE_PERMISSIONS = {
  [ROLES.MANAGER]: {
    canAccess: [
      "dashboard",

      // LAPORAN & TRANSAKSI
      "menu/report",
      "menu/report/finance",
      "menu/transaction",

      // UNIT (FULL)
      "menu/unit",
      "menu/unit/create",
      "menu/unit/update",
      "menu/unit/:unitCode",

      // USER (ADMIN & SUPERVISOR) - manager can manage users including delete
      "menu/user",
      "menu/user/create",
      "menu/user/update",
      "menu/user/:nik",

      // CUSTOMER
      "menu/customer",
      "menu/customer/:customerId",

      // RENTAL
      "menu/rental",
      "menu/rental/:rentId",

      "menu/profile",
    ],
  },

  [ROLES.SUPERVISOR]: {
    canAccess: [
      "dashboard",

      // UNIT (CREATE & EDIT but limited to unit operations)
      "menu/unit",
      "menu/unit/create",
      "menu/unit/update",
      "menu/unit/:unitCode",

      // USER (CREATE ADMIN SAJA — backend validates elevated actions)
      "menu/user",
      "menu/user/create",
      "menu/user/:nik",

      // CUSTOMER (VIEW)
      "menu/customer",
      "menu/customer/:customerId",

      // RENTAL (VIEW)
      "menu/rental",
      "menu/rental/:rentId",

      "menu/profile",
    ],
  },

  [ROLES.ADMIN]: {
    canAccess: [
      "dashboard",

      // RENTAL OPERASIONAL only
      "menu/rental",
      "menu/rental/create",
      "menu/rental/:rentId",

      // CUSTOMER (BISA BLOKIR)
      "menu/customer",
      "menu/customer/:customerId",

      "menu/profile",
    ],
  },
};

export const getCurrentUser = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Check if token expired
    if (decoded.exp && decoded.exp < currentTime) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const hasAccessToRoute = (path, userRole) => {
  const cleanPath = "/" + path.replace(/^\//, "").split("?")[0];

  // 1️⃣ CEK PUBLIC ROUTE DULU
  const isPublic = PUBLIC_ROUTES.some(
    (publicPath) =>
      cleanPath === publicPath || cleanPath.startsWith(publicPath + "/"),
  );

  if (isPublic) return true;

  // 2️⃣ KALAU BUKAN PUBLIC → HARUS LOGIN & PUNYA ROLE
  if (!userRole) return false;

  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;

  const roleAllowed = permissions.canAccess.some((allowedPath) => {
    const cleanAllowed = "/" + allowedPath.replace(/^\//, "");
    return (
      cleanPath === cleanAllowed || cleanPath.startsWith(cleanAllowed + "/")
    );
  });

  return roleAllowed;
};

export const canPerformAction = (action, userRole) => {
  // action keys: create_user, delete_user, create_unit, edit_unit, delete_unit, operate_rental
  const actionPermissions = {
    create_user: [ROLES.MANAGER, ROLES.SUPERVISOR],
    delete_user: [ROLES.MANAGER],
    create_unit: [ROLES.MANAGER, ROLES.SUPERVISOR],
    edit_unit: [ROLES.MANAGER, ROLES.SUPERVISOR],
    delete_unit: [ROLES.MANAGER],
    operate_rental: [ROLES.ADMIN],
    view: [ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.ADMIN],
  };

  const allowedRoles = actionPermissions[action] || [];
  return allowedRoles.includes(userRole);
};

export const getAccessibleRoutes = (userRole) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions ? permissions.canAccess : [];
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("login");
};
