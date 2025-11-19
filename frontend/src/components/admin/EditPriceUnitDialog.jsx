import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../helpers/GetToken";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function EditPriceUnitDialog({ isOpen, onClose, priceData, onSuccess }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    duration: priceData?.duration || "",
    price_per_day: priceData?.price_per_day || "",
    status: priceData?.status || "Active",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Update form saat priceData berubah
  useEffect(() => {
    if (priceData) {
      setFormData({
        duration: priceData.duration || "",
        price_per_day: priceData.price_per_day || "",
        status: priceData.status || "Active",
      });
      setErrors({});
    }
  }, [priceData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error untuk field yang sedang di-edit
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Durasi harus lebih dari 0 hari";
    }
    if (!formData.price_per_day || formData.price_per_day <= 0) {
      newErrors.price_per_day = "Harga per hari harus lebih dari 0";
    }
    if (!formData.status) {
      newErrors.status = "Status harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const token = getToken();
      await axios.put(`${API_URL}/api/unit/price/${priceData.price_id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data harga berhasil diperbarui.",
        showConfirmButton: false,
        timer: 2000,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message || "Terjadi kesalahan saat memperbarui data.",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-500 text-xl" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Edit Data Harga
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Perbarui informasi harga rental unit Anda
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Duration Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Durasi Rental (Hari)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                  errors.duration
                    ? "border-red-500 bg-red-50 focus:border-red-600"
                    : "border-gray-200 focus:border-blue-500 bg-gray-50"
                }`}
                placeholder="Masukkan durasi dalam hari"
                min="1"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.duration}
                </p>
              )}
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Harga Per Hari (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 font-semibold">Rp</span>
                <input
                  type="number"
                  name="price_per_day"
                  value={formData.price_per_day}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                    errors.price_per_day
                      ? "border-red-500 bg-red-50 focus:border-red-600"
                      : "border-gray-200 focus:border-blue-500 bg-gray-50"
                  }`}
                  placeholder="Masukkan harga per hari"
                  min="1"
                />
              </div>
              {errors.price_per_day && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.price_per_day}
                </p>
              )}
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none bg-gray-50 ${
                  errors.status
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              >
                <option value="Active">Aktif</option>
                <option value="Inactive">Nonaktif</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.status}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-700">
                <strong>💡 Info:</strong> Harga per hari akan dikalikan dengan durasi untuk menghitung total biaya rental.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
    </>
  );
}
