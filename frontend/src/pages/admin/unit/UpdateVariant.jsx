"use client";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFloppyDisk,
  faUpload,
  faXmark,
  faCheck,
  faPalette,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader } from "../../../components/Loader";
import { getToken } from "../../../helpers/GetToken";

export default function UpdateVariantPage() {
  const { variantUnitCode } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    color: "",
    qty: "",
    status: "Available",
    photo: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [response, setResponse] = useState({ success: null, message: "" });
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // 🔹 Ambil data varian existing
  useEffect(() => {
    const fetchVariant = async () => {
      try {
        setLoadingData(true);
        const res = await axios.get(
          `${BASE_URL}/api/unit/variant-unit/${variantUnitCode}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        const data = res.data.data || res.data;

        console.log(data);
        setFormData({
          color: data.color || "",
          qty: data.qty || "",
          status: data.status || "Available",
          photo: data.photo || "",
        });

        if (data.photo) {
          setExistingImage(data.photo);
          setImagePreview(`${BASE_URL}/get-image/${data.photo}`);
        }
      } catch (err) {
        console.error(err);
        setResponse({
          success: false,
          message: err.response?.data?.message || "Gagal memuat data varian.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchVariant();
  }, [variantUnitCode]);

  // 🔹 Input text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Upload gambar
  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return setResponse({
        success: false,
        message: "File harus berupa gambar (PNG/JPG)",
      });
    }
    if (file.size > 5 * 1024 * 1024) {
      return setResponse({
        success: false,
        message: "Ukuran file maksimal 5MB",
      });
    }

    setImageFile(file);
    setExistingImage(null);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // 🔹 Drag handler
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  // 🔹 Hapus preview foto
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🔹 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse({ success: null, message: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("color", formData.color);
      formDataToSend.append("qty", formData.qty);
      formDataToSend.append("status", formData.status);

      if (imageFile) {
        formDataToSend.append("photo", imageFile);
      }

      await axios.put(
        `${BASE_URL}/api/unit/variant-unit/${variantUnitCode}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResponse({ success: true, message: "Varian berhasil diperbarui!" });
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error(err);
      setResponse({
        success: false,
        message: err.response?.data?.message || "Gagal memperbarui varian.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="font-medium">Kembali</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon
                icon={faPalette}
                className="text-white text-xl"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Varian</h1>
              <p className="text-gray-600 text-sm mt-1">
                Perbarui warna, jumlah, status, dan foto varian
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
              {/* === Upload Area === */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Foto Varian
                </label>

                {!imagePreview ? (
                  <div
                    className={`border-2 border-dashed rounded-xl transition-all ${
                      dragActive
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faUpload}
                          className="text-gray-400 text-xl"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Drag & drop foto di sini
                      </p>
                      <p className="text-xs text-gray-500 mb-4">atau</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                      >
                        Pilih File
                      </button>
                      <p className="text-xs text-gray-400 mt-3">
                        PNG, JPG max 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* === Input Area === */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Warna <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="color"
                    placeholder="contoh: Biru, Hitam, Putih"
                    value={formData.color}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jumlah (Qty) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="qty"
                    min="1"
                    value={formData.qty}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 transition-all outline-none bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* === Response === */}
            {response.message && (
              <div
                className={`mx-8 mb-6 flex items-center gap-3 p-4 rounded-xl ${
                  response.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <FontAwesomeIcon
                  icon={response.success ? faCheck : faXmark}
                  className={`text-lg ${
                    response.success ? "text-green-600" : "text-red-600"
                  }`}
                />
                <span
                  className={`font-medium ${
                    response.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {response.message}
                </span>
              </div>
            )}

            {/* === Buttons === */}
            <div className="bg-gray-50 px-8 py-6 flex justify-end gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
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
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                } text-white px-8 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFloppyDisk} /> Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
