import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom"; // Pastikan Navigate diimport
import axios from "axios";
import { getToken, removeToken } from "./GetToken";
import { Loader } from "../components/Loader";

export default function AdminAuth({ children }) {
  const token = getToken();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login"; // Penanda untuk /login

  const [isValid, setIsValid] = useState(null); // null: loading, true/false: hasil
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Jika TIDAK ADA token, set isValid=false dan hentikan.
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
          }
        );

        if (res.data.success) {
          setIsValid(true);
        } else {
          // Token ada tapi tidak valid (misal: kadaluarsa)
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
  }, [token]); // Hapus location.pathname dari dependency array agar verifyToken hanya fokus pada token

  // --- Rendering Logika Autentikasi ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        {/* Memeriksa autentikasi... */}
      </div>
      //   <Loader />
    );
  }

  // KASUS 1: Sudah Login (isValid=true)
  if (isValid) {
    // Jika sudah login TAPI mencoba mengakses /login, arahkan ke /dashboard
    if (isLoginPage) {
      return <Navigate to="/dashboard" replace />;
    }
    // Jika sudah login dan mengakses halaman lain (terproteksi), tampilkan children
    return children;
  }

  // KASUS 2: Belum Login (isValid=false)
  // Jika belum login TAPI sudah berada di /login, biarkan dia tetap di /login (tampilkan children)
  if (isLoginPage) {
    return children;
  }

  // Jika belum login DAN mencoba mengakses halaman terproteksi, arahkan ke /login
  return <Navigate to="/login" replace />;
}
