import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCaretDown,
  faSignOutAlt,
  faUserCircle,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useParams } from "react-router-dom";
import { getUserInfo } from "../../helpers/GetUserInfo";

export default function Header({ onMenuClick }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const { unitCode } = useParams();
  const { variantUnitCode } = useParams();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Manajemen Unit", path: "/menu/unit" },
    { name: "Tambah Unit", path: "/menu/unit/create" },
    { name: "Detail Unit", path: "/menu/unit/" + unitCode },
    { name: "Update Unit", path: "/menu/unit/update/" + unitCode },
    { name: "Unit", path: "/menu/unit" },
    { name: "Customer", path: "/customer" },
    { name: "Sewa Aktif", path: "/sewa-aktif" },
    { name: "Riwayat Sewa", path: "/riwayat-sewa" },
    { name: "Pembayaran", path: "/pembayaran" },
    { name: "Booking Request", path: "/booking-request" },
    { name: "Pengembalian", path: "/pengembalian" },
    {
      name: "Update Variant",
      path: "/menu/unit/variant/update/" + variantUnitCode,
    },
    {
      name: "Denda / Keterlambatan",
      path: "/denda",
    },
    { name: "Settings", path: "/settings" },
    { name: "Manajemen Akses", path: "/access-management" },
  ];

  const currentPage = navItems.find((item) => item.path === location.pathname);
  const pageTitle = currentPage ? currentPage.name : "Halaman Tidak Ditemukan";

  useEffect(() => {
    const user = getUserInfo();
    setUserName(user?.name);
    setUserRole(user?.email);

    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    alert("Logging out...");
    localStorage.removeItem("token");
    window.location.href = "/";
    setIsDropdownOpen(false);
  };

  return (
    <header className="flex items-center justify-between h-16 bg-white shadow-md px-4 sticky top-0 z-20 border-b border-gray-200">
      {/* Tombol Menu (Mobile) */}
      <div className="flex items-center space-x-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={onMenuClick}
        >
          <FontAwesomeIcon icon={faBars} className="w-5 h-5 text-gray-700" />
        </button>

        <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Kanan */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-sky-600 transition p-2 rounded-full hover:bg-gray-100">
          <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
        </button>

        {/* Profil */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img
              src="/images/sewaiphoneaja.png"
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <FontAwesomeIcon
              icon={faCaretDown}
              className={`w-3 h-3 text-gray-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              } hidden sm:block`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-30">
              <div className="flex items-center p-3 border-b border-gray-100">
                <img
                  src="/images/sewaiphoneaja.png"
                  alt="avatar"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
              </div>

              <button
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => alert("Go to Profile")}
              >
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className="w-4 h-4 mr-3 text-gray-500"
                />
                Lihat Profil
              </button>

              <div className="border-t border-gray-100 mt-2 pt-2 mb-2">
                <button
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="w-4 h-4 mr-3"
                  />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
