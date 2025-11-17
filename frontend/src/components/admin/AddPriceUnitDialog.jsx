"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../helpers/GetToken";
import Input from "../Input";
import ActionButton from "../ActionButton";
import ModalWrapper from "../ModalWrapper";
// FontAwesome tidak lagi diperlukan karena tidak ada upload foto
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";

// Nama komponen diubah dari AddPriceDialog menjadi AddPriceUnitDialog agar lebih jelas
export default function AddPriceUnitDialog({ isOpen, onClose, unit, onAdded }) {
  const API_URL = import.meta.env.VITE_API_URL;

  // State untuk Form data Harga Unit
  const [form, setForm] = useState({
    duration: 1, // Durasi sewa (misal: hari, bulan)
    price_per_day: 0, // Harga per hari/unit durasi
    status: "Active", // Status harga: Active/Inactive
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 1. Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setForm({
        duration: 1,
        price_per_day: 0,
        status: "Active",
      });
      setErrors({});
      // Tidak ada reset file/preview lagi
    }
  }, [isOpen]);

  // 2. Handler untuk input
  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === "duration" || field === "price_per_day") {
      // Pastikan value adalah angka dan minimal 0 atau 1 untuk duration
      value = Math.max(field === "duration" ? 1 : 0, Number(value));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // 3. Validasi Form
  const validate = () => {
    const newErrors = {};
    if (!form.duration || form.duration < 1)
      newErrors.duration = "Durasi minimal 1";
    if (
      !form.price_per_day ||
      Number(form.price_per_day) <= 0 ||
      isNaN(Number(form.price_per_day))
    )
      newErrors.price_per_day =
        "Harga per hari wajib diisi dan harus lebih dari 0";
    if (!form.status.trim()) newErrors.status = "Status wajib dipilih";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 4. Submit Form (POST ke /api/unit/price)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Payload data
    const payload = {
      unit_code: unit.unit_code,
      duration: form.duration,
      price_per_day: form.price_per_day,
      status: form.status,
    };

    setLoading(true);
    try {
      const res = await axios.post(
        // Ganti dari /api/unit/variant menjadi /api/unit/price
        `${API_URL}/api/unit/price`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            // Karena tidak ada file, Content-Type default (application/json) sudah benar
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
        "Gagal menambahkan harga unit: " +
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
      // Ganti judul modal
      title={`Tambah Harga Unit: ${unit.unit_name}`}
      maxWidth="max-w-xl" // Perkecil lebar karena form lebih sederhana
    >
      <div className="flex flex-col">
        <form
          onSubmit={handleSubmit}
          // Ganti ID form
          id="add-priceunit-form"
          className="grid grid-cols-1 gap-6" // Hapus layout 2 kolom
        >
          {/* Form Fields */}
          <div className="space-y-4">
            <Input
              label="Durasi (Hari)"
              type="number"
              value={form.duration}
              onChange={handleChange("duration")}
              min={1}
              placeholder="Masukkan durasi sewa dalam hari"
              error={errors.duration}
            />

            <Input
              label="Harga Per Hari"
              type="number"
              value={form.price_per_day}
              onChange={handleChange("price_per_day")}
              min={0}
              placeholder="Masukkan harga sewa per hari"
              error={errors.price_per_day}
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
                {/* Ganti opsi status sesuai model MstPriceUnit */}
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Footer tombol */}
          <div className="mt-4 flex justify-end gap-3">
            <ActionButton type="button" onClick={onClose} variant="secondary">
              Batal
            </ActionButton>
            <ActionButton
              type="submit"
              loading={loading}
              form="add-priceunit-form"
            >
              Simpan Harga
            </ActionButton>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
