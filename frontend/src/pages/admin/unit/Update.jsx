"use client";
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faXmark,
  faCheck,
  faMobile,
  faArrowLeft,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader } from "../../../components/Loader";

export default function UpdateUnitPage() {
  const [formData, setFormData] = useState({
    unit_name: "",
    brand: "",
    description: "",
    photo: "",
    status: "Available",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [response, setResponse] = useState({ success: null, message: "" });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const { unitCode } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;

  // 🔹 Load existing unit data
  useEffect(() => {
    const fetchUnitData = async () => {
      try {
        setLoadingData(true);
        const res = await axios.get(`${BASE_URL}/api/unit/${unitCode}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = res.data.data || res.data;

        setFormData({
          unit_name: data.unit_name || "",
          brand: data.brand || "",
          description: data.description || "",
          status: data.status || "Available",
          photo: data.photo || "",
        });

        if (data.photo) {
          setExistingImage(data.photo);
          setImagePreview(`${BASE_URL}/get-image/${data.photo}`);
        }
      } catch (err) {
        setResponse({
          success: false,
          message:
            err.response?.data?.message ||
            "Gagal memuat data unit dari server.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchUnitData();
  }, [unitCode]);

  // 🔹 Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Upload image (drag or file input)
  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return setResponse({
        success: false,
        message: "File harus berupa gambar (PNG/JPG).",
      });
    }
    if (file.size > 5 * 1024 * 1024) {
      return setResponse({
        success: false,
        message: "Ukuran file maksimal 5MB.",
      });
    }

    setImageFile(file);
    setExistingImage(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // 🔹 Drag events
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

  // 🔹 Remove photo preview (tanpa hapus di server)
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🔹 Submit form (update unit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse({ success: null, message: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("unit_name", formData.unit_name);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("status", formData.status);

      // kalau user upload foto baru
      if (imageFile) {
        formDataToSend.append("photo", imageFile);
      }

      // kalau user hapus foto
      if (!imagePreview && !existingImage) {
        formDataToSend.append("delete_image", "true");
      }

      await axios.put(`${BASE_URL}/api/unit/${unitCode}`, formDataToSend, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setResponse({ success: true, message: "Unit berhasil diperbarui!" });
      setTimeout(() => navigate("/menu/unit"), 1500);
    } catch (err) {
      console.error(err);
      setResponse({
        success: false,
        message: err.response?.data?.message || "Gagal memperbarui unit.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="font-medium">Kembali</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faMobile} className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Unit</h1>
              <p className="text-gray-600 text-sm mt-1">
                Perbarui informasi unit
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
              {/* === UPLOAD AREA === */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Foto Unit
                </label>

                {!imagePreview ? (
                  // tampilan upload pertama kali
                  <div
                    className={`border-2 border-dashed rounded-xl transition-all ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
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
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                      >
                        Pilih File
                      </button>
                      <p className="text-xs text-gray-400 mt-3">
                        PNG, JPG hingga 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  // tampilan ketika sudah ada foto
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

                {/* 🟢 Tambahkan input file di luar kondisi agar selalu aktif */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* === FORM INPUT === */}
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
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all outline-none text-gray-900 placeholder:text-gray-400"
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
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all outline-none resize-none text-gray-900 placeholder:text-gray-400"
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
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all outline-none text-gray-900 bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* === Response Message === */}
            {response.message && (
              <div
                className={`mx-8 mb-6 flex items-center gap-3 p-4 rounded-xl ${
                  response.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {response.success ? (
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-green-600 text-lg"
                  />
                ) : (
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="text-white" size={18} />
                  </div>
                )}
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
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                } text-white px-8 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Menyimpan...
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
