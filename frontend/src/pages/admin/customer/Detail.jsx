import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../../helpers/GetToken";
import { Loader } from "../../../components/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function DetailCustomerPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [customerData, setCustomerData] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/customer/${customerId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((res) => setCustomerData(res.data.data))
      .catch((err) => console.error(err));
  }, [API_URL, customerId]);

  if (!customerData) return <Loader />;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <div className=" space-y-6">
          {/* Header with Glassmorphism Effect */}
          <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-blue-900">
                  {customerData.fullname}
                </h1>
                <p className="text-gray-500 mt-2">Detail Informasi Customer</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/menu/customer")}
                  className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Kembali
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Kolom 1: Foto KTP */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  {!imageError ? (
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-white rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300" />

                      <div className="relative aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                        <img
                          src={`${API_URL}/get-image/${customerData.ktp_image}`}
                          alt={customerData.fullname}
                          onError={() => setImageError(true)}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[1.6/1] rounded-2xl bg-white shadow-xl border border-gray-200 flex flex-col items-center justify-center">
                      <svg
                        className="h-14 w-14 text-gray-400 mb-3"
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

                      <p className="text-gray-600 font-semibold">
                        Tidak ada foto KTP
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        File tidak ditemukan atau rusak
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom 2: Detail Customer */}
              <div className="p-8 lg:col-span-2 bg-white">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                  <span className="w-1 h-6 bg-blue-900 rounded mr-3"></span>
                  Informasi Customer
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                      Nama Lengkap
                    </p>
                    <p className="font-bold text-xl text-gray-800 relative z-10">
                      {customerData.fullname}
                    </p>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                      NIK
                    </p>
                    <p className="font-bold text-xl text-gray-800 relative z-10">
                      {customerData.nik || "-"}
                    </p>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-pink-50 to-white p-4 rounded-xl border border-pink-100 hover:border-pink-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-1">
                      Telepon
                    </p>
                    <p className="font-bold text-xl text-gray-800 relative z-10">
                      {customerData.telp || "-"}
                    </p>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <p className="font-bold text-lg text-gray-800 relative z-10 break-all">
                      {customerData.email || "-"}
                    </p>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full ${
                        customerData.status === "Active"
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-200"
                          : "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg shadow-red-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          customerData.status === "Active"
                            ? "bg-white"
                            : "bg-white"
                        } animate-pulse`}
                      ></span>
                      {customerData.status}
                    </span>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-white p-4 rounded-xl border border-pink-100 hover:border-pink-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2">
                      Username Media Sosial
                    </p>
                    <p className="text-gray-800 font-medium">
                      {customerData.social_media_username || "-"}
                    </p>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
                      Tipe Media Sosial
                    </p>
                    <p className="text-gray-800 font-medium">
                      {customerData.social_media_type || "-"}
                    </p>
                  </div>

                  <div className="sm:col-span-2 relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Alamat
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {customerData.address || "-"}
                    </p>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      Nama Kontak Terdekat
                    </p>
                    <p className="text-gray-800 font-medium">
                      {customerData.closest_contact_name || "-"}
                    </p>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                      Telepon Kontak Terdekat
                    </p>
                    <p className="text-gray-800 font-medium">
                      {customerData.closest_contact_telp || "-"}
                    </p>
                  </div>

                  <div className="sm:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      Tanggal Dibuat
                    </p>
                    <p className="text-gray-800 font-medium">
                      {customerData.created_at
                        ? new Date(customerData.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "2-digit", month: "long", year: "numeric" }
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
