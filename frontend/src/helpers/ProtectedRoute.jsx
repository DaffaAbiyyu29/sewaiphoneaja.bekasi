import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader } from "../components/shared/Loader";
import PageNotFound from "../components/shared/PageNotFound";
import { getCurrentUser, hasAccessToRoute } from "./authService";
import { getToken, removeToken } from "./GetToken";

/**
 * ProtectedRoute Component
 * Validates token, checks authentication, and verifies role-based access
 * If user doesn't have permission, shows 403 error
 */
export default function ProtectedRoute({ children }) {
  const token = getToken();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isRentFormPage = location.pathname === "/rent-form";

  const [isValid, setIsValid] = useState(null); // null: loading, true: valid, false: invalid
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    // If no token and not on login or rent-form page, redirect to login
    if (!token) {
      setIsValid(false);
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/verify`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.data.success) {
          setIsValid(true);

          // Check role-based access
          const user = getCurrentUser();
          if (user && user.role) {
            const hasAccess = hasAccessToRoute(location.pathname, user.role);
            setHasPermission(hasAccess);
          }
        } else {
          removeToken();
          setIsValid(false);
        }
      } catch (err) {
        console.error("Token verify error:", err);
        removeToken();
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, location.pathname]);

  // === LOADING STATE ===
  if (loading) {
    return <Loader />;
  }

  // === CASE 1: Already Logged In ===
  if (isValid) {
    // If already logged in but trying to access /login, redirect to dashboard
    if (isLoginPage) {
      return <Navigate to="/dashboard" replace />;
    }

    // Check if user has permission to access this route
    if (!hasPermission) {
      return (
        <PageNotFound
          message="Anda tidak memiliki akses ke halaman ini."
          statusCode={403}
        />
      );
    }

    // User is valid and has permission
    return children;
  }

  // === CASE 2: Not Logged In ===
  // Allow access to login and rent-form pages without authentication
  if (isLoginPage || isRentFormPage) {
    return children;
  }

  // Not logged in and trying to access protected page
  return <Navigate to="/login" replace />;
}
