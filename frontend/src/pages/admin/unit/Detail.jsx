import { useParams, useNavigate } from "react-router-dom";
import Datatable from "../../../components/Datatable";
import { VariantColumns } from "../../../columns/Variant";
import { PriceColumns } from "../../../columns/Price";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../../helpers/GetToken";
import { Loader } from "../../../components/Loader";
import AddVariantDialog from "../../../components/admin/AddVariantUnitDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import AddPriceUnitDialog from "../../../components/admin/AddPriceUnitDialog";

export default function DetailUnitPage() {
  const { unitCode } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [unitData, setUnitData] = useState(null);
  const [showDialogVariant, setShowDialogVariant] = useState(false);
  const [showDialogPrice, setShowDialogPrice] = useState(false);
  const [refreshKeyPrice, setRefreshKeyPrice] = useState(0);
  const [refreshKeyVariant, setRefreshKeyVariant] = useState(0);


  useEffect(() => {
    axios
      .get(`${API_URL}/api/unit/${unitCode}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((res) => setUnitData(res.data.data))
      .catch((err) => console.error(err));
  }, [API_URL, unitCode]);

  if (!unitData) return <Loader />;

  const handleAddVariantClick = () => {
    setShowDialogVariant(true);
  };

  const handleAddPriceClick = () => {
    setShowDialogPrice(true);
  };

  const handleDeleteVariant = async (variantUnitCode) => {
    const confirmResult = await Swal.fire({
      title: "Apakah kamu yakin?",
      text: "Variant ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    Swal.fire({
      title: "Menghapus variant...",
      text: "Mohon tunggu sebentar",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/unit/variant-unit/${variantUnitCode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Varian berhasil dihapus.",
        showConfirmButton: false,
        timer: 2000,
      });

      // 🔁 Refresh tabel varian saja
      setRefreshKeyVariant((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus!",
        text:
          err.response?.data?.message ||
          "Terjadi kesalahan saat menghapus varian.",
        confirmButtonText: "OK",
      });
    }
  };

  //edit price harga

  //delete price harga
  const handleDeletePrice = async (priceCode) => {
    const confirmResult = await Swal.fire({
      title: "Apakah kamu yakin?",
      text: "Harga ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    Swal.fire({
      title: "Menghapus harga...",
      text: "Mohon tunggu sebentar",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/unit/price/${priceCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Varian berhasil dihapus.",
        showConfirmButton: false,
        timer: 2000,
      });

      // 🔁 Refresh tabel varian saja
      setRefreshKeyPrice((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus!",
        text:
          err.response?.data?.message ||
          "Terjadi kesalahan saat menghapus varian.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className=" space-y-6">
        {/* Header with Glassmorphism Effect */}
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-blue-900 bg-clip-text text-transparent">
                {unitData.unit_name}
              </h1>
              <p className="text-gray-500 mt-1">Detail Informasi Unit</p>
            </div>
            <button
              onClick={() => navigate("/menu/unit")}
              className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Kembali
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Kolom 1: Foto Unit dengan Gradient Border */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                {unitData.photo ? (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-white rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                    <div className="relative">
                      <img
                        src={`${API_URL}/get-image/${unitData.photo}`}
                        alt={unitData.unit_name}
                        className="w-full rounded-2xl shadow-2xl object-cover transform group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-80 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl bg-white/50">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm font-medium text-gray-500">
                        Tidak ada foto
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kolom 2: Detail Unit */}
            <div className="p-8 lg:col-span-2 bg-white">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-1 h-6 bg-blue-900 rounded mr-3"></span>
                Informasi Unit
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                    Kode Unit
                  </p>
                  <p className="font-bold text-xl text-gray-800 relative z-10">
                    {unitData.unit_code}
                  </p>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    Nama Unit
                  </p>
                  <p className="font-bold text-xl text-gray-800 relative z-10">
                    {unitData.unit_name}
                  </p>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                    Brand
                  </p>
                  <p className="font-bold text-xl text-gray-800 relative z-10">
                    {unitData.brand}
                  </p>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-pink-50 to-white p-4 rounded-xl border border-pink-100 hover:border-pink-300 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-pink-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                  <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full ${
                      unitData.status === "Available"
                        ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-200"
                        : "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg shadow-red-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        unitData.status === "Available"
                          ? "bg-white"
                          : "bg-white"
                      } animate-pulse`}
                    ></span>
                    {unitData.status}
                  </span>
                </div>

                <div className="sm:col-span-2 relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Deskripsi
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {unitData.description || "Tidak ada deskripsi"}
                  </p>
                </div>

                <div className="sm:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                    Tanggal Dibuat
                  </p>
                  <p className="text-gray-800 font-medium">
                    {new Date(unitData.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price and Variant Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daftar Harga */}
          <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Daftar Harga</h2>
            </div>
            <Datatable
              key={refreshKeyPrice}
              apiUrl={`${API_URL}/api/unit/price/${unitCode}`}
              columns={PriceColumns(handleDeletePrice)}
              isSearch={true}
              isCard={false}
              allowAdd={true}
              onAddClick={handleAddPriceClick}
            />
          </div>

          {/* Daftar Variant */}
          <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Daftar Variant
              </h2>
            </div>
            <Datatable
              key={refreshKeyVariant}
              apiUrl={`${API_URL}/api/unit/variant/${unitCode}`}
              columns={VariantColumns(handleDeleteVariant)}
              isSearch={true}
              allowAdd={true}
              isCard={false}
              onAddClick={handleAddVariantClick}
            />
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setRefreshKeyPrice((prev) => prev + 1);
              setRefreshKeyVariant((prev) => prev + 1);
            }}
          >
            <span className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Tabel
            </span>
          </button>
        </div>
      </div>

      <AddVariantDialog
        isOpen={showDialogVariant}
        onClose={() => setShowDialogVariant(false)}
        unit={unitData}
        onAdded={(newVariant) => {
          console.log("Variant baru:", newVariant);
          setRefreshKeyVariant((prev) => prev + 1);
        }}
      />
      <AddPriceUnitDialog
        isOpen={showDialogPrice}
        onClose={() => setShowDialogPrice(false)}
        unit={unitData}
        onAdded={(newPrice) => {
          console.log("price baru:", newPrice);
          setRefreshKeyPrice((prev) => prev + 1);
        }}
      />
    </div>
  );
}
