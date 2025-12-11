import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import PaymentDialog from "../../components/PaymentDialog";

const Pesanan = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [unit, setUnit] = useState(null);
  const [rentData, setRentData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRentData = async () => {
    setLoading(true);
    try {
      // Menambahkan query parameter untuk pagination
      const res = await axios.get(
        `${API_URL}/api/rental/pesanan/${encodeURIComponent(searchTerm)}`
      );
      if (res.data.success) {
        setRentData(res.data.data);
        setUnit(res.data.data.details[0].unit);
      }
    } catch (err) {
      // console.error("Gagal ambil data unit:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRentData(null);
    setUnit(null);
    fetchRentData();
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Kita panggil fetchRentData di useEffect dengan dependency searchTerm/filterStatus
  };

  const handleOpenDetail = () => {
    setIsDialogOpen(true);
  };

  const closeModal = () => setIsDialogOpen(false);

  const getStatusColor = (status) => {
    const lower = status.toLowerCase();

    if (lower.includes("waiting")) {
      return "bg-yellow-100 text-yellow-800";
    }

    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "Close":
        return "bg-green-100 text-green-800";
      case "OverDue":
        return "bg-red-100 text-red-800";
      case "Invalid":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-16 px-6 sm:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Pesanan Anda
            </h1>
            <p className="text-blue-100 text-lg max-w-3xl mx-auto leading-relaxed">
              Cek status pesanan iPhone kamu di sini. Masukkan Invoice Number
              atau NIK untuk melihat detail pesanan.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Cari pesanan berdasarkan Invoice Number atau NIK..."
                value={searchTerm}
                onChange={handleSearchChange} // ✅ Gunakan fungsi baru
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all"
              />
            </div>
          </div>

          {/* Results Count */}
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              Menampilkan{" "}
              <span className="font-semibold text-gray-900">
                {unit ? 1 : 0} pesanan
              </span>{" "}
              dari{" "}
              {String(searchTerm).includes("INV") ? "Invoice Number" : "NIK"}{" "}
              <span className="inline-block bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-xs font-bold">
                {searchTerm}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid daftar unit */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-900 mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data unit...</p>
          </div>
        ) : (
          <>
            {/* ✅ Ganti filteredUnits menjadi units karena filtering/pagination sudah di API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {unit && Object.keys(unit).length > 0 ? (
                (() => {
                  const item = unit;
                  const start = new Date(rentData.start_rent_date);
                  const end = new Date(rentData.end_rent_date);

                  // hitung selisih hari
                  const totalDays = Math.ceil(
                    (end - start) / (1000 * 60 * 60 * 24)
                  );

                  const startFormatted = start.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  });

                  const endFormatted = end.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={item.unit_code}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      {/* ======= IMAGE AREA (ga gue ubah) ======= */}
                      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-5 h-72 flex items-center justify-center overflow-hidden">
                        {item.photo ? (
                          <img
                            src={`${API_URL}/get-image/${item.variant?.photo}`}
                            alt={item.unit_name}
                            className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-16 h-16 text-gray-300 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-gray-400 text-sm font-medium">
                              No Image Available
                            </span>
                          </div>
                        )}

                        <div className="absolute top-4 right-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg
                              ${getStatusColor(rentData.status)}
                            `}
                          >
                            {rentData.status}
                          </span>
                        </div>
                      </div>

                      {/* ======= CONTENT ======= */}
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                          {item.unit_name} - {item.variant.color}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium">
                          {item.brand}
                        </p>
                        <p className="text-gray-500 text-sm font-medium">
                          {rentData.invoice_number}
                        </p>
                        <p className="text-gray-500 text-sm font-medium mb-4">
                          {rentData.customer.fullname}
                        </p>

                        {/* DURATION */}
                        <div className="bg-blue-50 rounded-xl p-4 mb-2">
                          <span className="text-xs text-gray-600">
                            Durasi sewa
                          </span>

                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-md font-bold text-blue-900">
                              {startFormatted} - {endFormatted}
                            </span>

                            <span className="text-sm text-gray-600 font-medium">
                              {totalDays} hari
                            </span>
                          </div>
                        </div>

                        {/* ACTION BUTTON */}
                        <button
                          className="w-full py-3 mt-4 rounded-xl font-semibold transition-all duration-300 bg-blue-900 hover:bg-blue-800 text-white shadow-lg"
                          onClick={() => handleOpenDetail()}
                        >
                          Lihat Detail Pesanan
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <svg
                    className="w-24 h-24 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500 font-medium text-lg mb-2">
                    Tidak ada unit yang ditemukan
                  </p>
                  <p className="text-gray-400 text-sm">
                    Pesanan anda dengan Invoice Number atau NIK "{searchTerm}"
                    tidak tersedia
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Dialog Detail */}
      <PaymentDialog
        isOpen={isDialogOpen}
        onClose={closeModal}
        rentalData={rentData}
      />
    </div>
  );
};

export default Pesanan;
