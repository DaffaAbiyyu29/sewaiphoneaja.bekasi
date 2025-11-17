// RentalForm.jsx - Enhanced with Stepper Tabs Layout

"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";

// Import komponen kustom
import Input from "../../components/Input";
import axios from "axios";
import { getToken } from "../../helpers/GetToken";
import SelectPrice from "../../components/customer/SelectPrice";
import SelectColor from "../../components/customer/SelectColor";
import SelectRentalDate from "../../components/customer/SelectRentalDate";
import SelectQuantity from "../../components/customer/SelectQuantity";
import GalleryUnit from "../../components/customer/GaleryUnit";
import PriceSummary from "../../components/customer/PriceSummary";
import ActionButton from "../../components/ActionButton";

// Data dummy untuk dropdown Jenis Sosial Media
const socialMediaOptions = [
  { value: "", label: "Pilih Jenis Sosial Media" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter (X)" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "lainnya", label: "Lainnya" },
];

// =========================================================================
// Helper SVG Components (Unchanged)
// =========================================================================

const SVGCheck = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const SVGAlertCircle = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SVGUser = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const SVGCreditCard = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const SVGUpload = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

const SVGPackage = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
    />
  </svg>
);

const SVGX = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const SVGPhone = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const SVGCalendar = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const Check = SVGCheck;
const AlertCircle = SVGAlertCircle;

const initialUnit = {
  unit_code: "",
  unit_name: "Unit Sewa",
  photo: "",
  description: "",
  prices: [],
  required_id_card: false,
  required_passport: false,
  required_driving_license: false,
  required_others: false,
  variants: [],
};

// =========================================================================
// Main Component
// =========================================================================

const RentalForm = ({ onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef(null);

  // === State Management ===
  const [currentStep, setCurrentStep] = useState(1); // NEW STATE FOR STEPPER
  const [unit, setUnit] = useState(initialUnit);
  const [selectedData, setSelectedData] = useState();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    identity_type: "KTP",
    nik: "",
    contactName: "",
    contactPhone: "",
    socialMediaType: "",
    socialMediaUsername: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [retry, setRetry] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [mainImage, setMainImage] = useState({ id: null, src: "" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:00");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    setSelectedData(JSON.parse(sessionStorage.getItem("selectedUnit")));
  }, []);

  // =========================================================================
  // Fetch Data Unit (Unchanged)
  // =========================================================================
  const fetchUnitData = async () => {
    // ... (kode fetchUnitData tidak diubah)
    try {
      const unitCode = selectedData.unitCode;
      if (!unitCode) return;

      const res = await axios.get(`${API_URL}/api/unit/catalog/${unitCode}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = res.data.data;
      const mappedUnit = {
        unit_code: data.unit_code,
        unit_name: data.unit_name,
        photo: data.photo,
        description: data.description,
        prices: data.prices || [],
        required_id_card: data.required_id_card || false,
        required_passport: data.required_passport || false,
        required_driving_license: data.required_driving_license || false,
        required_others: data.required_others || false,
        variants: data.variants || [],
      };
      setUnit(mappedUnit);

      const activePrices =
        mappedUnit.prices?.filter((p) => p.status === "Active") || [];
      if (activePrices.length > 0) setSelectedPrice(activePrices[0]);

      if (mappedUnit.variants.length > 0) {
        setSelectedVariant(mappedUnit.variants[0]);
        setMainImage({
          id: mappedUnit.variants[0].variant_unit_code,
          src: mappedUnit.variants[0].photo,
        });
      } else {
        setMainImage({ id: mappedUnit.unit_code, src: mappedUnit.photo });
      }
    } catch (err) {
      console.error("Gagal mengambil data unit dari API:", err);
    }
  };

  useEffect(() => {
    console.log(selectedData);
    fetchUnitData().then(() => {
      setRetry(true);
    });
  }, [selectedData]);

  useEffect(() => {
    if (retry && (!unit || Object.keys(unit).length === 0)) {
      fetchUnitData();
    }
  }, [retry, unit]);

  useEffect(() => {
    if (startDate && selectedPrice) {
      const newMinEndDate = calculateMinEndDate(startDate);
      if (!endDate || new Date(endDate) < new Date(newMinEndDate)) {
        setEndDate(newMinEndDate);
      }
    } else {
      setEndDate("");
    }
  }, [startDate, selectedPrice]);

  // =========================================================================
  // Derived State and Calculations (Unchanged)
  // =========================================================================
  const activePrices = unit.prices?.filter((p) => p.status === "Active") || [];
  const hasVariants = unit.variants?.length > 0;
  const requiredRentalDays = selectedPrice?.duration || 0;

  const calculateMinEndDate = (start) => {
    if (!start || requiredRentalDays === 0) return "";

    const startDateTime = new Date(`${start}T${startTime}:00`);
    const minEndObj = new Date(startDateTime);

    const msInDay = 1000 * 60 * 60 * 24;
    const minimumDurationMs = requiredRentalDays * msInDay;

    // Atur waktu akhir minimum. Kurangi 1ms agar Math.ceil() menghasilkan requiredRentalDays
    minEndObj.setTime(startDateTime.getTime() + minimumDurationMs - 1);

    return minEndObj.toISOString().split("T")[0];
  };

  const minEndDate = calculateMinEndDate(startDate);

  const rentalDays = (() => {
    if (!startDate || !endDate || !startTime || !endTime) return 0;

    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    if (endDateTime.getTime() <= startDateTime.getTime()) return 0;

    const diffTime = endDateTime.getTime() - startDateTime.getTime();
    const msInDay = 1000 * 60 * 60 * 24;

    return Math.max(1, Math.ceil(diffTime / msInDay));
  })();

  // LOGIKA: VALIDASI KELIPATAN HARI (3, 6, 9, dst.)
  const isDurationValid = (() => {
    if (requiredRentalDays <= 1 || rentalDays === 0) return true;
    if (rentalDays < requiredRentalDays) return false;
    return rentalDays % requiredRentalDays === 0;
  })();

  const calculateTotal = () => {
    if (!selectedPrice || !startDate || !endDate || !startTime || !endTime)
      return 0;

    const finalDays = rentalDays;

    return finalDays * quantity * parseFloat(selectedPrice.price_per_day);
  };

  const availableStock = hasVariants
    ? selectedVariant
      ? selectedVariant.qty
      : 0
    : unit.qty || 0;

  const totalPrice = calculateTotal();

  // Tombol Sewa Disabled jika:
  const isSewaDisabled =
    !selectedPrice ||
    !startDate ||
    !endDate ||
    quantity <= 0 ||
    (hasVariants && !selectedVariant) ||
    !isDurationValid;

  // =========================================================================
  // Handlers (Most Unchanged)
  // =========================================================================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSelectVariant = (variant) => {
    if (selectedVariant?.variant_unit_code === variant.variant_unit_code) {
      setSelectedVariant(null);
      setQuantity(1);
    } else {
      setSelectedVariant(variant);
      setQuantity(1);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setErrors((prev) => ({ ...prev, photo: "" }));
  };

  const handleImageChange = (file) => {
    setErrors((prev) => ({ ...prev, photo: "" }));
    if (!file) {
      removeImage();
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: "Foto harus jpg, png, atau webp",
      }));
      removeImage();
      return;
    }

    const maxSizeMB = 5;
    if (file.size / 1024 / 1024 > maxSizeMB) {
      setErrors((prev) => ({
        ...prev,
        photo: `Ukuran foto maksimal ${maxSizeMB}MB`,
      }));
      removeImage();
      return;
    }

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
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageChange(file);
  };

  // =========================================================================
  // Validation and Step Navigation Logic
  // =========================================================================

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    // Validation for Step 1 (Unit & Schedule)
    if (step === 1) {
      if (!selectedPrice)
        newErrors.selectedPrice = "Paket harga wajib dipilih.";
      if (hasVariants && !selectedVariant)
        newErrors.selectedVariant = "Warna unit wajib dipilih.";
      if (!startDate) newErrors.startDate = "Tanggal mulai sewa wajib diisi.";
      if (!endDate) newErrors.endDate = "Tanggal selesai sewa wajib diisi.";
      if (!isDurationValid)
        newErrors.isDurationValid =
          "Durasi sewa harus kelipatan dari paket harga yang dipilih.";

      isValid = Object.keys(newErrors).length === 0;
    }

    // Validation for Step 2 (Personal Data)
    if (step === 2) {
      if (!formData.name) newErrors.name = "Nama lengkap wajib diisi.";
      if (!formData.phone || !/^\d{9,15}$/.test(formData.phone))
        newErrors.phone = "Nomor telepon tidak valid.";
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Alamat email tidak valid.";
      if (!formData.address) newErrors.address = "Alamat wajib diisi.";
      if (
        !formData.nik ||
        formData.nik.length !== 16 ||
        !/^\d+$/.test(formData.nik)
      )
        newErrors.nik = "NIK wajib diisi dan harus 16 digit angka.";
      if (!formData.contactName)
        newErrors.contactName = "Nama kontak terdekat wajib diisi.";
      if (!formData.contactPhone || !/^\d{9,15}$/.test(formData.contactPhone))
        newErrors.contactPhone = "Nomor telepon kontak terdekat tidak valid.";
      if (!formData.socialMediaType)
        newErrors.socialMediaType = "Jenis sosial media wajib dipilih.";
      if (!formData.socialMediaUsername)
        newErrors.socialMediaUsername = "Username sosial media wajib diisi.";

      isValid = Object.keys(newErrors).length === 0;
    }

    // Validation for Step 3 (Document) - Only if required_id_card is true
    if (step === 3) {
      if (unit.required_id_card && !imageFile) {
        newErrors.photo = `File ${formData.identity_type} wajib diunggah.`;
      }
      isValid = Object.keys(newErrors).length === 0;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0); // Scroll to top on step change
    } else {
      window.scrollTo(0, 0); // Scroll to top to show errors
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const rentalData = {
        unit_code: unit.unit_code,
        variant_unit_code: selectedVariant?.variant_unit_code || null,
        price_id: selectedPrice.price_id,
        quantity: quantity,
        start_date: `${startDate}T${startTime}:00`,
        end_date: `${endDate}T${endTime}:00`,
        total_price: totalPrice,
        customer: {
          ...formData,
          // Include identity_type for backend logic if needed
          identity_type: formData.identity_type,
        },
      };

      const payload = new FormData();
      payload.append("data", JSON.stringify(rentalData));
      if (imageFile) payload.append("id_card_file", imageFile);

      const response = await axios.post(
        `${API_URL}/api/v1/rental/submit`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSubmissionSuccess(true);
      } else {
        throw new Error(response.data.message || "Pengajuan gagal dikirim.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Terjadi kesalahan saat mengirim pengajuan. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // Step Content Rendering Function
  // =========================================================================
  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        // STEP 1: Unit Selection (Pilih Paket & Jadwal)
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <SVGPackage className="w-6 h-6 text-white" size={24} />
                <h2 className="text-xl font-bold text-white">
                  Step 1: Pilih Paket & Jadwal
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <SelectPrice
                activePrices={activePrices}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
              />
              {errors.selectedPrice && (
                <p className="text-red-600 text-sm font-medium flex items-center gap-2 bg-red-50 px-4 py-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" size={20} />
                  {errors.selectedPrice}
                </p>
              )}

              {hasVariants && (
                <>
                  <SelectColor
                    variants={unit.variants}
                    selectedVariant={selectedVariant}
                    handleSelectVariant={handleSelectVariant}
                  />
                  {errors.selectedVariant && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-2 bg-red-50 px-4 py-3 rounded-lg">
                      <AlertCircle className="w-5 h-5" size={20} />
                      {errors.selectedVariant}
                    </p>
                  )}
                </>
              )}

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <SVGCalendar className="w-5 h-5 text-blue-600" size={20} />
                  <h3 className="font-bold text-gray-900">Jadwal Penyewaan</h3>
                </div>
                <SelectRentalDate
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  startTime={startTime}
                  setStartTime={setStartTime}
                  endTime={endTime}
                  setEndTime={setEndTime}
                  rentalDays={rentalDays}
                  requiredRentalDays={requiredRentalDays}
                  minEndDate={minEndDate}
                  isDurationValid={isDurationValid}
                />
                {(errors.startDate ||
                  errors.endDate ||
                  errors.isDurationValid) && (
                  <p className="text-red-600 text-sm font-medium flex items-center gap-2 bg-red-50 px-4 py-3 rounded-lg mt-4">
                    <AlertCircle className="w-5 h-5" size={20} />
                    {errors.startDate ||
                      errors.endDate ||
                      errors.isDurationValid}
                  </p>
                )}
                {/* Note: The original <li> for !isDurationValid is moved/modified into the error message */}
              </div>

              <SelectQuantity
                unit={unit}
                quantity={quantity}
                setQuantity={setQuantity}
                availableStock={availableStock}
                hasVariants={hasVariants}
                selectedVariant={selectedVariant}
              />
            </div>
          </div>
        );

      case 2:
        // STEP 2: Personal Data (Data Diri & Kontak)
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <SVGUser className="w-6 h-6 text-white" size={24} />
                <h2 className="text-xl font-bold text-white">
                  Step 2: Data Diri & Kontak
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input
                    label="NIK (Nomor Induk Kependudukan)"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    placeholder="16 digit NIK"
                    maxLength={16}
                    error={errors.nik}
                  />
                </div>

                <Input
                  label="Nama Lengkap"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Sesuai KTP"
                  error={errors.name}
                />

                <Input
                  label="Nomor Telepon"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  type="tel"
                  error={errors.phone}
                />

                <Input
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@contoh.com"
                  type="email"
                  error={errors.email}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Alamat Lengkap"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Alamat lengkap sesuai KTP"
                    type="textarea"
                    error={errors.address}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center gap-2 mb-5">
                  <SVGPhone className="w-5 h-5 text-orange-600" size={20} />
                  <h3 className="font-bold text-gray-900">Kontak Darurat</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <Input
                    label="Nama Kontak Darurat"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Nama kerabat/teman"
                    error={errors.contactName}
                  />

                  <Input
                    label="Nomor Telepon Kontak Darurat"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    type="tel"
                    error={errors.contactPhone}
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center gap-2 mb-5">
                  <svg
                    className="w-5 h-5 text-pink-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <h3 className="font-bold text-gray-900">Akun Media Sosial</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="socialMediaType"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Platform
                    </label>
                    <select
                      name="socialMediaType"
                      id="socialMediaType"
                      value={formData.socialMediaType}
                      onChange={handleChange}
                      className={`block w-full border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 p-3 text-sm font-medium transition-all ${
                        errors.socialMediaType
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      {socialMediaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.socialMediaType && (
                      <p className="text-red-600 text-xs mt-2 font-medium flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" size={16} />
                        {errors.socialMediaType}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Username"
                    name="socialMediaUsername"
                    value={formData.socialMediaUsername}
                    onChange={handleChange}
                    placeholder="@username"
                    error={errors.socialMediaUsername}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        // STEP 3: Document Upload (Upload Dokumen Identitas)
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <SVGCreditCard className="w-6 h-6 text-white" size={24} />
                <h2 className="text-xl font-bold text-white">
                  Step 3: Upload Dokumen Identitas
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {unit.required_id_card && (
                <div>
                  <label
                    htmlFor="identity_type"
                    className="block text-sm font-bold text-gray-900 mb-3"
                  >
                    Jenis Dokumen
                  </label>
                  <select
                    id="identity_type"
                    name="identity_type"
                    value={formData.identity_type}
                    onChange={handleChange}
                    className="block w-full md:w-1/2 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 text-sm font-medium bg-white transition-all"
                  >
                    <option value="KTP">KTP (Kartu Tanda Penduduk)</option>
                    {unit.required_passport && (
                      <option value="Passport">Passport</option>
                    )}
                    {unit.required_driving_license && (
                      <option value="SIM">SIM (Surat Izin Mengemudi)</option>
                    )}
                    {unit.required_others && (
                      <option value="Lainnya">Lainnya</option>
                    )}
                  </select>
                </div>
              )}

              {/* Upload Area */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Upload Foto {formData.identity_type}
                </label>

                {!imagePreview ? (
                  <div
                    className={`relative border-3 border-dashed rounded-xl cursor-pointer transition-all duration-300 p-10 min-h-[300px] flex items-center justify-center group ${
                      dragActive
                        ? "border-green-500 bg-green-50 scale-[1.02]"
                        : errors.photo
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                          <SVGUpload className="text-white" size={40} />
                        </div>
                      </div>

                      <p className="text-lg font-bold text-gray-900 mb-2">
                        Drag & Drop File Di Sini
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        atau klik untuk memilih file
                      </p>
                      <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl border-2 border-gray-300 text-sm font-bold text-gray-700 group-hover:border-green-400 group-hover:text-green-600 transition-all shadow-sm">
                        Pilih File
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
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check
                              className="w-5 h-5 text-green-600"
                              size={20}
                            />
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
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl"
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

              {/* Info Box */}
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-5">
                <div className="flex gap-3">
                  <AlertCircle
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div className="text-sm text-amber-900">
                    <p className="font-bold mb-2">Persyaratan Foto:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Foto harus jelas dan tidak buram</li>
                      <li>Semua informasi terbaca dengan baik</li>
                      <li>Tidak terpotong atau tertutup</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // =========================================================================
  // Success Screen (Unchanged)
  // =========================================================================
  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border-2 border-green-100">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-8 shadow-2xl">
                <Check className="w-20 h-20 mx-auto text-white" size={80} />
              </div>
            </div>

            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Berhasil! 🎉
            </h2>

            <p className="text-xl text-gray-700 mb-3 font-semibold">
              Pengajuan penyewaan{" "}
              <span className="text-green-600">{unit.unit_name}</span> telah
              kami terima
            </p>

            <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
              Tim kami akan segera memproses dan menghubungi Anda melalui email
              atau telepon dalam waktu 1x24 jam
            </p>

            <ActionButton
              onClick={onClose}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all px-12 py-5 text-lg font-bold rounded-2xl"
            >
              Tutup
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Main Form Layout with Stepper
  // =========================================================================
  const stepperItems = [
    { step: 1, title: "Detail Unit", icon: SVGPackage },
    { step: 2, title: "Data Diri", icon: SVGUser },
    { step: 3, title: "Dokumen", icon: SVGCreditCard },
  ];

  const Stepper = ({ currentStep, items }) => (
    <div className="flex items-center justify-between text-sm">
      {items.map((item, index) => {
        const isActive = item.step === currentStep;
        const isCompleted = item.step < currentStep;
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.step}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-blue-600 text-white ring-4 ring-blue-200"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" size={20} />
                ) : (
                  item.step
                )}
              </div>
              <span
                className={`font-semibold transition-colors duration-300 hidden sm:block ${
                  isActive ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {item.title}
              </span>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-1 transition-all duration-300 mx-4 ${
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                }`}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Progress Steps / Stepper */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Stepper currentStep={currentStep} items={stepperItems} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Formulir Penyewaan
          </h1>
          <p className="text-xl text-gray-600 font-medium">{unit.unit_name}</p>
        </div>

        {/* Error Global */}
        {errors.submit && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 shadow-lg">
              <div className="flex items-start gap-4">
                <AlertCircle
                  className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                  size={24}
                />
                <div>
                  <p className="font-bold text-red-900 text-lg mb-1">
                    Terjadi Kesalahan
                  </p>
                  <p className="text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: Gallery & Summary - Sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-32 space-y-6">
              {/* Gallery */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <GalleryUnit
                  unit={unit}
                  selectedVariant={selectedVariant}
                  mainImage={mainImage}
                  setMainImage={setMainImage}
                  API_URL={API_URL}
                />
              </div>

              {/* Price Summary */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-xl text-white">
                <PriceSummary
                  totalPrice={totalPrice}
                  rentalDays={rentalDays}
                  quantity={quantity}
                  selectedPrice={selectedPrice}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Render Current Step Content */}
            {renderStepContent(currentStep)}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-md font-bold transition-all border-2 border-gray-300 shadow-md"
                >
                  &larr; Kembali
                </button>
              )}
              {currentStep === 1 && <div />}{" "}
              {/* Placeholder to push next button right */}
              {currentStep < stepperItems.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isSewaDisabled && currentStep === 1}
                  className={`px-6 py-3 rounded-xl text-md font-bold transition-all shadow-lg hover:shadow-xl ml-auto ${
                    isSewaDisabled && currentStep === 1
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
                  }`}
                >
                  Lanjut ke Step {currentStep + 1} &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || isSewaDisabled}
                  className={`w-full ${
                    loading || isSewaDisabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 shadow-2xl hover:shadow-3xl transform hover:scale-[1.01] active:scale-[0.99]"
                  } text-white px-10 py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-4 group relative overflow-hidden`}
                >
                  {loading ? (
                    <>
                      <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengirim Pengajuan...</span>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <Check
                        className="w-7 h-7 transform group-hover:rotate-12 transition-transform"
                        size={28}
                      />
                      <span>Kirim Pengajuan Sekarang</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Terms (Only visible on the final step for submission) */}
            {currentStep === stepperItems.length && (
              <p className="text-xs text-center text-gray-500 leading-relaxed mt-4">
                Dengan mengirim formulir, Anda menyetujui{" "}
                <span className="font-semibold text-blue-600 cursor-pointer hover:underline">
                  syarat & ketentuan
                </span>{" "}
                penyewaan kami
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalForm;
