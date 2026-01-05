import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Unit", href: "/unit" },
  { name: "Pesanan", href: "/pesanan" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="relative flex items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/sewaiphoneaja.png"
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <div className="flex flex-col text-sm leading-tight">
            <span className="font-bold text-sky-900">SewaIphoneAja.Bekasi</span>
            <span className="text-xs text-gray-500">
              Penyewaan iPhone Bekasi
            </span>
          </div>
        </Link>

        {/* Desktop Menu - CENTER */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 gap-x-12">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-semibold pb-1 border-b-2 transition ${
                  isActive
                    ? "border-blue-900 text-blue-900"
                    : "border-transparent hover:border-gray-300 text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(true)}
        >
          <FontAwesomeIcon icon={faBars} className="w-5 h-5 text-gray-700" />
        </button>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        {/* Mobile Drawer */}
        <div
          className={`absolute top-0 left-0 h-full w-full bg-white rounded-b-2xl shadow-xl transform transition-transform duration-300 ${
            mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <img
                src="/images/sewaiphoneaja.png"
                alt="Logo"
                className="w-9 h-9"
              />
              <div className="flex flex-col text-sm leading-tight">
                <span className="font-bold text-sky-900">
                  SewaIphoneAja.Bekasi
                </span>
                <span className="text-xs text-gray-500">
                  Penyewaan iPhone Bekasi
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-600 hover:text-red-500 transition"
            >
              <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Menu */}
          <div className="p-4">
            <p className="text-xs font-bold uppercase text-sky-900 tracking-wide mb-2">
              Menu Utama
            </p>

            <div className="flex flex-col gap-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm transition ${
                      isActive
                        ? "bg-sky-100 text-sky-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
