import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPercent,
  faMobile,
  faUser,
  faCartShopping,
  faClockRotateLeft,
  faCreditCard,
  faClipboardList,
  faUndo,
  faExclamationTriangle,
  faCogs,
  faUserCog,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { createPortal } from "react-dom";

// ===== MENU SECTION =====
const generalItems = [{ name: "Dashboard", path: "/dashboard", icon: faHome }];

const masterItems = [
  { name: "Unit", path: "/menu/unit", icon: faMobile },
  { name: "Customer", path: "/customer", icon: faUser },
];

const transactionItems = [
  { name: "Sewa Aktif", path: "/sewa-aktif", icon: faCartShopping },
  { name: "Riwayat Sewa", path: "/riwayat-sewa", icon: faClockRotateLeft },
  { name: "Pembayaran", path: "/pembayaran", icon: faCreditCard },
  { name: "Booking Request", path: "/booking-request", icon: faClipboardList },
  { name: "Pengembalian", path: "/pengembalian", icon: faUndo },
  {
    name: "Denda / Keterlambatan",
    path: "/denda",
    icon: faExclamationTriangle,
  },
];

const settingItems = [
  { name: "Settings", path: "/settings", icon: faCogs },
  { name: "Manajemen Akses", path: "/access-management", icon: faUserCog },
];

// ===== Tooltip Component (pakai portal biar gak ke-clip) =====
function Tooltip({ text, position }) {
  if (!position) return null;
  return createPortal(
    <div
      className="fixed z-[9999] bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md pointer-events-none"
      style={{
        top: position.y,
        left: position.x + 10,
        transform: "translateY(-50%)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>,
    document.body
  );
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const location = useLocation();
  const [tooltip, setTooltip] = useState(null);

  // fungsi render nav section
  const renderNavSection = (title, items, collapsed, showDivider = true) => (
    <div key={title} className="mb-4 relative">
      {!collapsed && (
        <div className="text-xs font-bold uppercase text-sky-900 tracking-wider mt-4 mb-2 ml-3">
          {title}
        </div>
      )}
      {items.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 group ${
              active
                ? "bg-sky-50 text-sky-900 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onMouseEnter={(e) => {
              if (collapsed) {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  text: item.name,
                  position: {
                    x: rect.right,
                    y: rect.top + rect.height / 2,
                  },
                });
              }
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <FontAwesomeIcon
              icon={item.icon}
              className={`w-5 h-5 ${!collapsed && "mr-3"} ${
                active
                  ? "text-sky-800"
                  : "text-gray-500 group-hover:text-sky-800"
              }`}
            />
            {!collapsed && <span className="text-sm">{item.name}</span>}
          </Link>
        );
      })}
      {showDivider && (
        <div className="mx-3 my-4 border-t border-gray-100"></div>
      )}
    </div>
  );

  return (
    <>
      {/* === DESKTOP SIDEBAR === */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 shadow-xl fixed h-full z-30 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            } p-4 border-b border-gray-200`}
          >
            <div className="flex items-center">
              <img
                src="/images/sewaiphoneaja.png"
                alt="Logo"
                className="w-10 h-10 object-contain mr-2"
              />
              {!collapsed && (
                <div className="flex flex-col text-sm leading-tight">
                  <span className="font-bold text-sky-900">
                    SewaIphoneAja.Bekasi
                  </span>
                  <span className="text-xs text-gray-500">
                    Penyewaan iPhone Bekasi
                  </span>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {renderNavSection("Umum", generalItems, collapsed)}
            {renderNavSection("Master Data", masterItems, collapsed)}
            {renderNavSection("Transaksi", transactionItems, collapsed)}
            {renderNavSection("Pengaturan", settingItems, collapsed, false)}
          </nav>

          <div className="p-3 border-t border-gray-200">
            <button
              className={`hidden md:flex items-center w-full p-2 rounded-lg justify-center hover:bg-gray-100 text-gray-500 hover:text-sky-800 transition-colors ${
                collapsed ? "mx-auto" : "justify-end"
              }`}
              onClick={() => setCollapsed && setCollapsed(!collapsed)}
            >
              <FontAwesomeIcon
                icon={collapsed ? faAngleDoubleRight : faAngleDoubleLeft}
                className="w-4 h-4"
              />
              {!collapsed && <span className="text-sm ml-2">Ciutkan Menu</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* === TOOLTIP === */}
      {tooltip && <Tooltip {...tooltip} />}

      {/* === MOBILE SIDEBAR === */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={`absolute top-0 left-0 w-full h-full bg-white shadow-xl transform transition-transform duration-500 ${
            mobileOpen ? "translate-y-0" : "-translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <img
                src="/images/sewaiphoneaja.png"
                alt="Logo"
                className="w-10 h-10 mr-2"
              />
              <span className="font-bold text-sky-900 text-lg">
                SewaIphoneAja.Bekasi
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-600 hover:text-red-500 transition"
            >
              <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
            {renderNavSection("Umum", generalItems, false)}
            {renderNavSection("Master Data", masterItems, false)}
            {renderNavSection("Transaksi", transactionItems, false)}
            {renderNavSection("Pengaturan", settingItems, false, false)}
          </div>
        </div>
      </div>
    </>
  );
}
