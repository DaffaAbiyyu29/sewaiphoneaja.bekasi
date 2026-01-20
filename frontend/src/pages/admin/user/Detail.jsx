import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "../../../components/shared/Loader";
import { getToken } from "../../../helpers/GetToken";

export default function DetailUserPage() {
  const { nik } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/user/${nik}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((res) => setUserData(res.data.data))
      .catch((err) => console.error(err));
  }, [API_URL, nik]);

  if (!userData) return <Loader />;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <div className=" space-y-6">
          {/* Header with Glassmorphism Effect */}
          <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-blue-900 bg-clip-text text-transparent">
                  {userData.name}
                </h1>
                <p className="text-gray-500 mt-1">Detail Informasi User</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/menu/user")}
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
              {/* Kolom 1: Foto Profil */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  {userData.profile_picture ? (
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-white rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                      <div className="relative">
                        <img
                          src={`${API_URL}/get-image/${userData.profile_picture}`}
                          alt={userData.name}
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

              {/* Kolom 2: Detail User */}
              <div className="p-8 lg:col-span-2 bg-white">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                  <span className="w-1 h-6 bg-blue-900 rounded mr-3"></span>
                  Informasi User
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      NIK
                    </p>
                    <p className="font-bold text-xl text-gray-800 relative z-10">
                      {userData.nik}
                    </p>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                      Nama
                    </p>
                    <p className="font-bold text-xl text-gray-800 relative z-10">
                      {userData.name}
                    </p>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <p className="font-bold text-xl text-gray-800 relative z-10">
                      {userData.email || "-"}
                    </p>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-pink-50 to-white p-4 rounded-xl border border-pink-100 hover:border-pink-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full ${
                        userData.status === "Active"
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-200"
                          : "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg shadow-red-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          userData.status === "Active" ? "bg-white" : "bg-white"
                        } animate-pulse`}
                      ></span>
                      {userData.status}
                    </span>
                  </div>

                  <div className="sm:col-span-2 relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Alamat
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {userData.address || "-"}
                    </p>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      Tempat, Tanggal Lahir
                    </p>
                    <p className="text-gray-800 font-medium">
                      {userData.birth_place || "-"},{" "}
                      {new Date(userData.birth_date).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                      Telp
                    </p>
                    <p className="text-gray-800 font-medium">
                      {userData.telp || "-"}
                    </p>
                  </div>

                  <div className="sm:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      Tanggal Dibuat
                    </p>
                    <p className="text-gray-800 font-medium">
                      {userData.created_at
                        ? new Date(userData.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "2-digit", month: "long", year: "numeric" },
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
