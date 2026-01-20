import {
  faCalendar,
  faFilePdf,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion"; // Import Framer Motion
import { useState } from "react";
import { CustomerColumns } from "../../../columns/CustomerReport";
import { RentalColumns } from "../../../columns/RentalReport";
import { RevenueColumns } from "../../../columns/RevenueReport";
import { UnitColumns } from "../../../columns/UnitReport";
import Datatable from "../../../components/shared/Datatable";
import { getToken } from "../../../helpers/GetToken";
import { getWIBDate } from "../Dashboard";

// --- Komponen NavTabs Modern dengan Framer Motion ---
const NavTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex bg-gray-100 p-1.5 rounded-xl gap-1 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              relative flex-1 min-w-[140px] px-4 py-2.5 text-sm font-bold transition-colors duration-300 rounded-lg
              ${isActive ? "text-white" : "text-gray-500 hover:text-gray-700"}
            `}
          >
            {/* Background Animation untuk Tab Aktif */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-900 rounded-lg shadow-md"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const Laporan = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [activeTab, setActiveTab] = useState("pendapatan");
  const [refreshKey, setRefreshKey] = useState(0);

  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return getWIBDate(firstDay);
  });

  const [dateTo, setDateTo] = useState(() => getWIBDate(new Date()));

  const handleFilter = () => setRefreshKey((k) => k + 1);

  const handleReset = () => {
    setDateFrom("");
    setDateTo("");
    handleFilter();
  };

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleExportPdf = async () => {
    const token = getToken();

    if (!dateFrom || !dateTo) {
      alert("Pilih periode tanggal dulu");
      return;
    }

    const typeMap = {
      pendapatan: "revenue",
      rental: "rental",
      customer: "customer",
      unit: "unit",
    };

    const type = typeMap[activeTab];

    // ini langsung buka pdf di tab baru tanpa blob
    window.open(
      `${API_URL}/api/admin/reports/export?type=${type}&startDate=${dateFrom}&endDate=${dateTo}&token=${token}`,
      "_blank",
    );
  };

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          Pusat Laporan
        </h1>
        <p className="text-gray-500 mt-1">
          Kelola dan pantau performa bisnis Anda secara real-time.
        </p>
      </header>

      {/* Filter Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 mb-8">
        <div className="flex items-center gap-2 mb-6 text-blue-600 font-bold uppercase tracking-wider text-xs">
          <FontAwesomeIcon icon={faFilter} />
          <span>Filter Periode</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 px-6 py-2.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Terapkan Filter
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
            >
              Reset
            </button>
            <button
              onClick={handleExportPdf}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faFilePdf} />
              <span className="md:hidden lg:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Container Tab Responsif */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <NavTabs
            tabs={[
              { key: "pendapatan", label: "Pendapatan" },
              { key: "rental", label: "Rental" },
              { key: "customer", label: "Customer" },
              { key: "unit", label: "Unit" },
            ]}
            activeTab={activeTab}
            onChange={(k) => handleTabChange(k)}
          />
        </div>

        <div className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "pendapatan" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">
                    Laporan Pendapatan
                  </h3>
                  <Datatable
                    refreshKey={refreshKey}
                    apiUrl={`${API_URL}/api/admin/reports?type=revenue&startDate=${dateFrom}&endDate=${dateTo}`}
                    columns={RevenueColumns()}
                    isCard={false}
                  />
                </div>
              )}

              {activeTab === "rental" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">
                    Laporan Rental
                  </h3>
                  <Datatable
                    refreshKey={refreshKey}
                    apiUrl={`${API_URL}/api/admin/reports?type=rental&startDate=${dateFrom}&endDate=${dateTo}`}
                    columns={RentalColumns()}
                    isCard={false}
                  />
                </div>
              )}

              {activeTab === "customer" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">
                    Laporan Customer
                  </h3>
                  <Datatable
                    refreshKey={refreshKey}
                    apiUrl={`${API_URL}/api/admin/reports?type=customer&startDate=${dateFrom}&endDate=${dateTo}`}
                    columns={CustomerColumns(() => {})}
                    isCard={false}
                  />
                </div>
              )}

              {activeTab === "unit" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">
                    Laporan Performance Unit
                  </h3>
                  <Datatable
                    refreshKey={refreshKey}
                    apiUrl={`${API_URL}/api/admin/reports?type=unit&startDate=${dateFrom}&endDate=${dateTo}`}
                    columns={UnitColumns(() => {})}
                    isCard={false}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Laporan;
