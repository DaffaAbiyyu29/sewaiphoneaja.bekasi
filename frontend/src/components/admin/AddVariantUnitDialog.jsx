"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getToken } from "../../helpers/GetToken";
import Input from "../Input";
import ActionButton from "../ActionButton";
import ModalWrapper from "../ModalWrapper";
// Asumsi impor FontAwesome sudah tersedia di proyek Anda
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function AddVariantDialog({ isOpen, onClose, unit, onAdded }) {
  const API_URL = import.meta.env.VITE_API_URL;

  // State untuk Form data non-file
  const [form, setForm] = useState({
    color: "",
    qty: 1,
    status: "Available",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // State baru/diperbarui untuk File Upload dan Preview
  const [imageFile, setImageFile] = useState(null); // File objek
  const [imagePreview, setImagePreview] = useState(null); // URL untuk preview
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setForm({
        color: "",
        qty: 1,
        status: "Available",
      });
      setErrors({});
      setImageFile(null); // Reset file
      setImagePreview(null); // Reset preview
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input file
    }
  }, [isOpen]);

  // 2. Handler untuk input non-file
  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === "qty") {
      value = Math.max(1, Number(value));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // 3. Handler untuk perubahan file (klik/manual/drop)
  const handleImageChange = (file) => {
    setErrors((prev) => ({ ...prev, photo: "" })); // Reset error foto
    if (!file) {
      removeImage();
      return;
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: "Foto harus jpg, png, atau webp",
      }));
      removeImage();
      return;
    }

    // Validasi ukuran file (max 5MB)
    const maxSizeMB = 5;
    if (file.size / 1024 / 1024 > maxSizeMB) {
      setErrors((prev) => ({
        ...prev,
        photo: `Ukuran foto maksimal ${maxSizeMB}MB`,
      }));
      removeImage();
      return;
    }

    // Set file dan preview
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // 4. Drag & Drop Handlers
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

  // 5. Remove Image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 6. Validasi Form
  const validate = () => {
    const newErrors = {};
    if (!form.color.trim()) newErrors.color = "Warna wajib diisi";
    if (!form.qty || form.qty < 1) newErrors.qty = "Jumlah minimal 1";
    if (!form.status.trim()) newErrors.status = "Status wajib dipilih";

    // Validasi file (jika ada file)
    if (imageFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(imageFile.type)) {
        newErrors.photo = "Foto harus jpg, png, atau webp";
      }
      const maxSizeMB = 5;
      if (imageFile.size / 1024 / 1024 > maxSizeMB) {
        newErrors.photo = `Ukuran foto maksimal ${maxSizeMB}MB`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 7. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formDataPayload = new FormData();
    formDataPayload.append("unit_code", unit.unit_code);
    formDataPayload.append("color", form.color);
    formDataPayload.append("qty", form.qty);
    formDataPayload.append("status", form.status);

    if (imageFile) formDataPayload.append("photo", imageFile);

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/unit/variant-unit`,
        formDataPayload,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            // Hapus Content-Type: application/json
          },
        }
      );

      if (res.data.success) {
        onAdded(res.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert(
        "Gagal menambahkan variant: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (!unit) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`Tambah Variant ${unit.unit_name}`}
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col">
        {/* Struktur Form yang Benar */}
        <form
          onSubmit={handleSubmit}
          id="add-variant-form"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Kiri: Form Fields */}
          <div className="space-y-4">
            <Input
              label="Warna"
              value={form.color}
              onChange={handleChange("color")}
              placeholder="Masukkan warna"
              error={errors.color}
            />

            <Input
              label="Jumlah"
              type="number"
              value={form.qty}
              onChange={handleChange("qty")}
              min={1}
              placeholder="Masukkan jumlah"
              error={errors.qty}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={handleChange("status")}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.status
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-900"
                }`}
              >
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Kanan: Drag & Drop Foto */}
          <div className="flex flex-col justify-start">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Foto Unit
            </label>

            {/* Area Drag & Drop / Preview */}
            {!imagePreview ? (
              <div
                className={`flex-1 border-2 border-dashed rounded-xl cursor-pointer transition-all flex items-center justify-center p-6 min-h-[250px] ${
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
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUpload}
                      className="text-gray-400 text-xl"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drag & drop atau klik untuk upload
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP hingga 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="relative group flex-1">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl shadow-md min-h-[250px]"
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
            )}

            {/* Tombol Ganti/Hapus & Error Foto */}
            {imagePreview && (
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
                <input // Input file hidden untuk Ganti Foto
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageChange(e.target.files[0])}
                  className="hidden"
                />
              </div>
            )}
            {errors.photo && (
              <p className="text-red-500 text-sm mt-3">{errors.photo}</p>
            )}
          </div>
          <div className="mt-4 flex justify-end gap-3"></div>
          {/* Footer tombol - Di luar Form, tapi dikaitkan dengan form ID */}
          <div className="mt-4 flex justify-end gap-3">
            <ActionButton type="button" onClick={onClose} variant="secondary">
              Batal
            </ActionButton>
            <ActionButton
              type="submit"
              loading={loading}
              form="add-variant-form"
            >
              Simpan
            </ActionButton>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
