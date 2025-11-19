import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../admin/Sidebar";
import Header from "../admin/Header";
import Footer from "../admin/Footer";

export default function LayoutAdmin() {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="h-screen flex bg-gray-50 overflow-hidden">
        {/* === SIDEBAR DESKTOP === */}
        <div
          className={`hidden md:block fixed top-0 left-0 h-full bg-white shadow-md transition-all duration-300 z-30 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* === SIDEBAR MOBILE === */}
        {isMobile && (
          <Sidebar
            collapsed={false}
            mobileOpen={sidebarOpen}
            setMobileOpen={setSidebarOpen}
          />
        )}

        {/* === MAIN CONTENT === */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            collapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          {/* HEADER */}
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* CONTENT */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
}
