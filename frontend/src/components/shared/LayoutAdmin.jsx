import "animate.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Outlet } from "react-router-dom";
import Swal from "sweetalert2";
import { getToken } from "../../helpers/GetToken";
import { getUserInfo } from "../../helpers/GetUserInfo";
import Footer from "../admin/Footer";
import Header from "../admin/Header";
import Sidebar from "../admin/Sidebar";
import Avatar from "./Avatar";

export default function LayoutAdmin() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isReady, setIsReady] = useState(false);

  const fetchUserData = async () => {
    try {
      const user = getUserInfo();
      const token = getToken();

      const response = await axios.get(`${API_URL}/api/user/${user.nik}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUserData(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUserData(); // tunggu user data kelar
      setIsReady(true); // layout siap
    };

    init();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const isLoginSuccess = localStorage.getItem("login") === "success";
    if (!isReady || !isLoginSuccess) return;

    const user = getUserInfo();
    let avatarRoot = null;

    Swal.fire({
      title: "Login Berhasil",
      html: `
      <div id="swal-avatar-root"></div>
      <p style="margin:0">
        Selamat datang kembali,<br/>
        <b>${user?.name || "User"}</b>
      </p>
    `,
      confirmButtonText: "Masuk",
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: "rounded-swal",
        confirmButton: "confirm-swal",
      },
      showClass: {
        popup: "animate__animated animate__zoomIn",
        backdrop: "animate__animated animate__fadeIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
        backdrop: "animate__animated animate__fadeOut",
      },
      didOpen: () => {
        const el = document.getElementById("swal-avatar-root");
        if (!el) return;

        if (!avatarRoot) {
          avatarRoot = createRoot(el);
        }

        avatarRoot.render(
          <Avatar image={user?.avatar} name={user?.name} size="24" />,
        );
      },
    });

    localStorage.removeItem("login");
  }, [isReady]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* SIDEBAR */}
      <aside
        className={`hidden md:flex flex-shrink-0 bg-white shadow-md transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      {isMobile && (
        <Sidebar
          collapsed={false}
          mobileOpen={sidebarOpen}
          setMobileOpen={setSidebarOpen}
        />
      )}

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} userData={userData} />

        <main className="flex-1 overflow-y-auto px-4 py-4">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
