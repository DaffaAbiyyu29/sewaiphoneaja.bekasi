import {
  faBars,
  faCaretDown,
  faSignOutAlt,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "animate.css";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { removeToken } from "../../helpers/GetToken";
import Avatar from "../Avatar";

export default function Header({ onMenuClick, userData }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const { unitCode } = useParams();
  const { nik } = useParams();
  const { customerId } = useParams();
  const { variantUnitCode } = useParams();
  const { rentId } = useParams();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Manajemen Unit", path: "/menu/unit" },
    { name: "Tambah Unit", path: "/menu/unit/create" },
    { name: "Detail Unit", path: "/menu/unit/" + unitCode },
    { name: "Update Unit", path: "/menu/unit/update/" + unitCode },
    { name: "Unit", path: "/menu/unit" },
    { name: "Penyewaan", path: "/menu/rental" },
    { name: "Detail Penyewaan", path: "/menu/rental/" + rentId },

    { name: "Manajemen Customer", path: "/menu/customer" },
    { name: "Detail Customer", path: "/menu/customer/" + customerId },
    { name: "Manajemen User", path: "/menu/user" },
    { name: "Tambah User", path: "/menu/user/create" },
    { name: "Detail User", path: "/menu/user/" + nik },
    { name: "Update User", path: "/menu/user/update/" + nik },
    { name: "Profile Pengguna", path: "/menu/profile" },
    { name: "Sewa Aktif", path: "/sewa-aktif" },
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

  // const API_URL = import.meta.env.VITE_API_URL;

  // const fetchUserData = async () => {
  //   try {
  //     const user = getUserInfo();
  //     const token = getToken();

  //     const response = await axios.get(`${API_URL}/api/user/${user.nik}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.data.success) {
  //       setUserName(response.data.data.name);
  //       setUserRole(response.data.data.role);
  //       setUserPhoto(response.data.data.profile_picture);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  useEffect(() => {
    // fetchUserData();

    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Sesi kamu bakal berakhir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,

      customClass: {
        popup: "rounded-swal",
        confirmButton: "confirm-swal",
        cancelButton: "cancel-swal",
      },

      showClass: {
        popup: "animate__animated animate__zoomIn",
        backdrop: "animate__animated animate__fadeIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
        backdrop: "animate__animated animate__fadeOut",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Logging out...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        setTimeout(() => {
          removeToken();
          window.location.href = "/";
        }, 1200);
      }
    });
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
        {/* <button className="text-gray-500 hover:text-sky-600 transition p-2 rounded-full hover:bg-gray-100">
          <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
        </button> */}

        {/* Profil */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Avatar
              image={userData?.profile_picture}
              name={userData?.name}
              size={10}
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
              <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                <Avatar
                  image={userData?.profile_picture}
                  name={userData?.name}
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {userData?.name}
                  </p>
                  <p className="text-xs text-gray-500">{userData?.role}</p>
                </div>
              </div>

              <button
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => (window.location.href = "/menu/profile")}
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
