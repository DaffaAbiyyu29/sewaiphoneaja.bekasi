import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import DetailUnitDialog from "../../components/DetailUnitDialog";

const Unit = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;

  const fetchUnits = async (page) => {
    setLoading(true);
    try {
      // Menambahkan query parameter untuk pagination
      const res = await axios.get(
        `${API_URL}/api/unit/catalog?page=${page}&pageSize=${pageSize}&search=${searchTerm}`
      );
      if (res.data.success) {
        setUnits(res.data.data);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Gagal ambil data unit:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits(1);
  }, [searchTerm, filterStatus]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchUnits(page); // Panggil API untuk halaman baru
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Kita panggil fetchUnits di useEffect dengan dependency searchTerm/filterStatus
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    // Kita panggil fetchUnits di useEffect dengan dependency searchTerm/filterStatus
  };

  const filteredUnits = units.filter((item) => {
    const matchSearch = item.unit_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const totalStock = item.variants?.reduce((sum, v) => sum + (v.qty || 0), 0);
    const isAvailable = totalStock > 0 && item.status === "Available";

    if (filterStatus === "available") return matchSearch && isAvailable;
    if (filterStatus === "unavailable") return matchSearch && !isAvailable;
    return matchSearch;
  });

  const handleOpenDetail = (unit) => {
    setSelectedUnit(unit);
    setIsDialogOpen(true);
  };

  const closeModal = () => setIsDialogOpen(false);

  // Statistics
  const totalUnits = units.length;
  const availableUnits = units.filter((item) => {
    const totalStock = item.variants?.reduce((sum, v) => sum + (v.qty || 0), 0);
    return totalStock > 0 && item.status === "Available";
  }).length;
  const totalStock = units.reduce((sum, item) => {
    return sum + (item.variants?.reduce((s, v) => s + (v.qty || 0), 0) || 0);
  }, 0);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-16 px-6 sm:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Katalog Unit iPhone
            </h1>
            <p className="text-blue-100 text-lg max-w-3xl mx-auto leading-relaxed">
              Sewa iPhone original dengan harga terjangkau. Semua unit dalam
              kondisi prima, bergaransi, dan siap dikirim ke seluruh Indonesia.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Unit
                  </p>
                  <p className="text-3xl font-bold">{totalUnits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/30 p-4 rounded-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tersedia</p>
                  <p className="text-3xl font-bold">{availableUnits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/30 p-4 rounded-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Stok
                  </p>
                  <p className="text-3xl font-bold">{totalStock}</p>
                </div>
              </div>
            </div>
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
                placeholder="Cari iPhone berdasarkan model..."
                value={searchTerm}
                onChange={handleSearchChange} // ✅ Gunakan fungsi baru
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => handleFilterChange("all")}
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === "all"
                    ? "bg-blue-900 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => handleFilterChange("available")}
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === "available"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tersedia
              </button>
              <button
                onClick={() => handleFilterChange("unavailable")}
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === "unavailable"
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Habis
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Menampilkan{" "}
            <span className="font-semibold text-gray-900">
              {filteredUnits.length}
            </span>{" "}
            dari {totalUnits} unit
          </div>
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
              {units.length > 0 ? (
                units.map((item) => {
                  const totalStock = item.variants?.reduce(
                    (sum, v) => sum + (v.qty || 0),
                    0
                  );

                  const oneDayPrice =
                    item.prices?.find(
                      (p) => p.duration === 1 && p.status === "Active"
                    )?.price_per_day || 0;

                  const isAvailable =
                    totalStock > 0 && item.status === "Available";

                  return (
                    // ... (Konten Card Unit tetap sama) ...
                    <div
                      key={item.unit_code}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      {/* Image Container */}
                      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-5 h-72 flex items-center justify-center overflow-hidden">
                        {item.photo ? (
                          <img
                            src={`${API_URL}/get-image/${item.photo}`}
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

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                              isAvailable
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {isAvailable ? "Available" : "Habis"}
                          </span>
                        </div>

                        {/* Stock Badge */}
                        {isAvailable && (
                          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-blue-900"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                              <span className="text-xs font-bold text-gray-700">
                                {totalStock} unit
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                          {item.unit_name}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium mb-4">
                          {item.brand}
                        </p>

                        {/* Price */}
                        <div className="bg-blue-50 rounded-xl p-4 mb-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs text-gray-600">
                              Mulai dari
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold text-blue-900">
                              Rp {parseInt(oneDayPrice).toLocaleString("id-ID")}
                            </span>
                            <span className="text-sm text-gray-600 font-medium">
                              /hari
                            </span>
                          </div>
                        </div>

                        {/* Variants Preview */}
                        {item.variants && item.variants.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2 font-medium">
                              {item.variants.length} varian warna tersedia
                            </p>
                            <div className="flex gap-1.5 overflow-x-auto pb-1">
                              {item.variants.slice(0, 5).map((variant, idx) => (
                                <div
                                  key={idx}
                                  className="flex-shrink-0 w-8 h-8 rounded-lg border-2 border-gray-200 overflow-hidden bg-white shadow-sm"
                                >
                                  {variant.photo ? (
                                    <img
                                      src={`${API_URL}/get-image/${variant.photo}`}
                                      alt={variant.color}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {item.variants.length > 5 && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-600">
                                    +{item.variants.length - 5}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <button
                          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                            isAvailable
                              ? "bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                          disabled={!isAvailable}
                          onClick={() => handleOpenDetail(item)}
                        >
                          {isAvailable ? (
                            <>
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              <span>Lihat Detail</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              <span>Tidak Tersedia</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
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
                    Coba ubah kata kunci pencarian atau filter Anda
                  </p>
                </div>
              )}
            </div>

            {/* ⭐⭐ KOMPONEN PAGINATION BARU ⭐⭐ */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sebelumnya
                </button>

                {/* Tombol Halaman */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 rounded-full font-semibold transition-colors ${
                        currentPage === pageNumber
                          ? "bg-blue-900 text-white shadow-md"
                          : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-300"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog Detail */}
      <DetailUnitDialog
        isOpen={isDialogOpen}
        onClose={closeModal}
        unit={selectedUnit}
      />
    </div>
  );
};

export default Unit;
