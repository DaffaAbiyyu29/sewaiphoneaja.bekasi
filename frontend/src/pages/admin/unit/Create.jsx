"use client";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faXmark,
  faCheck,
  faCircleExclamation,
  faMobile,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { getToken } from "../../../helpers/GetToken";

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateUnitPage() {
  const [formData, setFormData] = useState({
    unit_name: "",
    brand: "",
    description: "",
    status: "Available",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({ success: null, message: "" });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // 🔹 handle input text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 handle file select / preview
  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setResponse({ success: false, message: "File harus berupa gambar!" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 🔹 drag & drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageChange(file);
  };

  // 🔹 remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🔹 submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse({ success: null, message: "" });

    try {
      // --- PERUBAHAN UTAMA DI SINI: Menggunakan FormData ---

      // 🔹 1. Inisialisasi FormData
      const formDataPayload = new FormData();

      // 🔹 2. Masukkan data teks ke FormData
      formDataPayload.append("unit_name", formData.unit_name);
      formDataPayload.append("brand", formData.brand);
      formDataPayload.append("description", formData.description);
      formDataPayload.append("status", formData.status);

      // 🔹 3. Masukkan file gambar ke FormData
      // Ingat, 'photo' harus sama dengan nama field yang digunakan di Multer (upload.single('photo'))
      if (imageFile) {
        formDataPayload.append("photo", imageFile);
      }

      // 🔹 4. Kirim request pakai axios (FormData)
      const res = await axios.post(`${API_URL}/api/unit`, formDataPayload, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      // --- (Sisanya sama) ---
      if (res.data.success) {
        setResponse({ success: true, message: "Unit berhasil dibuat!" });
        setTimeout(() => (window.location.href = "/menu/unit"), 1500);
      }
    } catch (err) {
      console.error(err);
      // 🔹 Handle error respons axios
      if (err.response) {
        setResponse({
          success: false,
          message: err.response.data.message || "Gagal membuat unit",
        });
      } else if (err.request) {
        setResponse({
          success: false,
          message: "Tidak dapat terhubung ke server (CORS / Network error)",
        });
      } else {
        setResponse({ success: false, message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FontAwesomeIcon icon={faMobile} className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tambah Unit Baru
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Lengkapi informasi unit dengan detail
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
            {/* Upload Foto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Foto Unit
              </label>

              {!imagePreview ? (
                <div
                  className={`border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faUpload}
                        className="text-gray-400 text-xl"
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Drag & drop atau klik untuk upload
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG hingga 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-xl flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="opacity-0 group-hover:opacity-100 transition-all bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Detail */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="unit_name"
                  placeholder="contoh: iPhone 15 Pro Max"
                  value={formData.unit_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  placeholder="contoh: Apple"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  placeholder="Tuliskan deskripsi detail tentang unit ini..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all outline-none resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all outline-none bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pesan Respon */}
          {response.message && (
            <div
              className={`mx-8 mb-6 flex items-center gap-3 p-4 rounded-xl ${
                response.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  response.success ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <FontAwesomeIcon
                  icon={response.success ? faCheck : faCircleExclamation}
                  className="text-white"
                />
              </div>
              <span
                className={`font-medium ${
                  response.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {response.message}
              </span>
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="bg-gray-50 px-8 py-6 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
              } text-white px-8 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  Simpan Unit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
