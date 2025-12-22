"use client";

import { useRef, useState, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";
import ActionButton from "./ActionButton";
import {
  SVGUpload,
  SVGCreditCard,
  SVGUser,
  SVGCalendar,
  SVGPackage,
  SVGPhone,
  SVGX,
  SVGCheck,
  SVGAlertCircle,
  SVGMobilePhone,
} from "./SVGComponents";
import axios from "axios";

const Check = SVGCheck;
const AlertCircle = SVGAlertCircle;

const currency = (v) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(v ?? 0));

export default function PaymentDialog({ isOpen, onClose, rentalData }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef(null);

  // imageFile = file proof yang bakal dikirim
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const start = new Date(rentalData?.start_rent_date);
  const end = new Date(rentalData?.end_rent_date);

  // hitung selisih hari
  const startFormatted = start.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const endFormatted = end.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Normalize rentalData
  const normalized = rentalData
    ? {
        rentId: rentalData.rent_id,
        invoiceNumber: rentalData.invoice_number,
        status: rentalData.status,
        unitName: rentalData?.details?.[0]?.unit?.unit_name ?? "-",
        variant: rentalData?.details?.[0]?.unit?.variant
          ? {
              color: rentalData.details[0].unit.variant.color,
              photo: rentalData.details[0].unit.variant.photo,
            }
          : null,
        pricePerDay:
          rentalData?.details?.[0]?.unit?.prices?.[0]?.price_per_day ?? null,
        priceName: rentalData?.details?.[0]?.unit?.prices?.[0]?.duration
          ? `${rentalData.details[0].unit.prices[0].duration} Hari`
          : "-",
        rentalDays:
          rentalData.start_rent_date && rentalData.end_rent_date
            ? Math.ceil(
                (new Date(rentalData.end_rent_date) -
                  new Date(rentalData.start_rent_date)) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
        qty: rentalData?.details?.[0]?.qty ?? 1,
        startDate: startFormatted,
        endDate: endFormatted,
        totalPrice: Number(rentalData.total_price ?? 0),
        customer: rentalData.customer ?? {},
      }
    : null;

  useEffect(() => {
    console.log(normalized);
    // reset ketika rentalData berubah / dialog ditutup
    if (!isOpen) {
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
      setDragActive(false);
    }
  }, [isOpen, rentalData]);

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setErrors((p) => ({ ...p, photo: "" }));
  };

  const validateFile = (file) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!file) return "Tidak ada file.";
    if (!allowed.includes(file.type))
      return "Format file harus JPG, PNG, atau WEBP.";
    const maxMB = 5;
    if (file.size / 1024 / 1024 > maxMB) return `Ukuran maksimal ${maxMB}MB.`;
    return "";
  };

  const handleImageChange = (file) => {
    const err = validateFile(file);
    if (err) {
      setErrors((p) => ({ ...p, photo: err }));
      return;
    }
    setErrors((p) => ({ ...p, photo: "" }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

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
    if (!e.dataTransfer) return;
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    handleImageChange(f);
  };

  const handleSubmit = async () => {
    if (!imageFile || !normalized) return;
    setSubmitting(true);

    try {
      if (!imageFile) {
        setErrors((prev) => ({
          ...prev,
          photo: `Foto bukti pembayaran wajib diunggah.`,
        }));
        // setLoading(false);
        return;
      }

      const form = new FormData();
      if (imageFile) {
        form.append("photo", imageFile);
      }

      // form.append("proof_of_payment", imageFile.name);
      form.append("rent_id", rentalData.rent_id);
      form.append("total_payment", 0); // default 0, admin yg update nanti

      // form.append("rentalData", JSON.stringify(rentalData));
      // form.append("customerData", JSON.stringify(normalized.customer));

      await axios.post(`${API_URL}/api/payment`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // success UX
      removeImage();
      onClose?.();
    } catch (err) {
      console.error(err);
      setErrors((p) => ({
        ...p,
        submit: "Gagal mengunggah. Coba lagi.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!normalized) return null;

  const getStatusBadgeColor = (status) => {
    const lower = status?.toLowerCase();

    if (lower?.includes("waiting")) {
      return "bg-yellow-100 text-yellow-800";
    }

    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "Close":
        return "bg-green-100 text-green-800";
      case "OverDue":
        return "bg-red-100 text-red-800";
      case "Invalid":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={() => onClose?.()}
      title={`Konfirmasi Pembayaran - ${normalized.invoiceNumber ?? ""}`}
      maxWidth="max-w-[1600px]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
        {/* LEFT: Details */}
        <div className="lg:col-span-7 bg-white/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-lg">
          {/* FOTO + STATUS */}
          <div className="relative p-5 h-80 flex items-center justify-center overflow-hidden mb-6">
            {normalized.variant?.photo ? (
              <img
                src={`${API_URL}/get-image/${normalized.variant.photo}`}
                alt={normalized.unit_name}
                className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
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

            {/* STATUS BADGE */}
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${getStatusBadgeColor(
                  normalized.status
                )}`}
              >
                {normalized.status}
              </span>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="w-full border-b border-slate-300/40 my-6"></div>

          {/* STATISTIK RENTAL */}
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-blue-900 flex items-center justify-center shadow-xl">
                <SVGMobilePhone className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {normalized.unitName}
                </h3>
                <p className="text-sm text-slate-600">
                  {normalized.priceName ?? "-"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">Durasi</p>
              <p className="font-semibold text-lg text-slate-900">
                {normalized.rentalDays} hari
              </p>
            </div>
          </div>

          {/* DETAIL GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* KOLOM KIRI */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <SVGPackage size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Qty</div>
                  <div className="font-medium text-slate-900">
                    {normalized.qty}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <SVGCalendar size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Tanggal Awal</div>
                  <div className="font-medium text-slate-900">
                    {normalized.startDate}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <SVGCalendar size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Tanggal Akhir</div>
                  <div className="font-medium text-slate-900">
                    {normalized.endDate}
                  </div>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN */}
            <div className="space-y-3">
              {normalized.variant && (
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <SVGUser size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Variant</div>
                    <div className="font-medium text-slate-900">
                      {normalized.variant.color}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <SVGPhone size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Customer</div>
                  <div className="font-medium text-slate-900">
                    {normalized.customer?.fullname ?? "-"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {normalized.customer?.telp ?? "-"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <SVGUser size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="font-medium text-slate-900">
                    {normalized.customer?.email ?? "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Upload + Total */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-blue-900 rounded-2xl p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs opacity-90">Total Pembayaran</div>
                <div className="text-2xl font-bold mt-1">
                  {currency(normalized.totalPrice)}
                </div>
                <div className="text-xs opacity-80 mt-1">
                  Termasuk biaya sewa & pajak jika ada
                </div>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="text-xs opacity-90">Invoice</div>
                <div className="font-mono font-semibold mt-1 text-sm text-white/95">
                  {rentalData?.invoice_number ?? "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Upload Card */}
          <div className="space-y-6">
            {/* Upload Area */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Upload Bukti Transfer / Pembayaran
              </label>

              {!imagePreview ? (
                <div
                  className={`relative border-3 border-dashed rounded-xl cursor-pointer transition-all duration-300 p-10 min-h-[300px] flex items-center justify-center group ${
                    dragActive
                      ? "border-blue-900 bg-blue-50 scale-[1.02] shadow-2xl"
                      : errors.photo
                      ? "border-red-400 bg-red-50 shadow-md"
                      : "border-gray-300 hover:border-blue-900 hover:bg-blue-50 hover:shadow-lg"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <SVGUpload className="text-white" size={40} />
                      </div>
                    </div>

                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {dragActive
                        ? "📤 Lepaskan File Di Sini"
                        : "Drag & Drop File Di Sini"}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      atau klik untuk memilih file
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 text-sm font-bold transition-all shadow-sm ${
                        dragActive
                          ? "bg-blue-100 border-blue-600 text-blue-600"
                          : "bg-white border-gray-300 text-gray-700 group-hover:border-blue-700 group-hover:text-blue-700"
                      }`}
                    >
                      {dragActive ? "Lepas gambar" : "Pilih File"}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      PNG, JPG, WEBP • Maks. 5MB
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative group rounded-xl overflow-hidden shadow-2xl border-2 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl shadow-xl transform hover:scale-110"
                    >
                      <SVGX className="w-5 h-5" size={20} />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-5 h-5 text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            File Berhasil Diupload
                          </p>
                          <p className="text-xs text-gray-600">
                            Klik ganti atau hapus untuk mengubah
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl"
                    >
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-all border-2 border-red-200"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}

              {errors.photo && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                  <p className="text-red-600 text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" size={20} />
                    {errors.photo}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <ActionButton
              className="w-full"
              disabled={!imageFile || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Mengirim..." : "Kirim Bukti Pembayaran"}
            </ActionButton>

            <button
              onClick={() => {
                removeImage();
                onClose?.();
              }}
              className="w-full py-3 rounded-lg border border-transparent text-sm hover:underline"
              type="button"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
