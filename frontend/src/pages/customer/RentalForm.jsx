// RentalForm.jsx - Enhanced with Stepper Tabs Layout

"use client";
import React, { useEffect, useRef, useState } from "react";

// Import komponen kustom
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/shared/ActionButton";
import GalleryUnit from "../../components/shared/GaleryUnit";
import Input from "../../components/shared/Input";
import PriceSummary from "../../components/shared/PriceSummary";
import SelectColor from "../../components/shared/SelectColor";
import SelectPrice from "../../components/shared/SelectPrice";
import SelectQuantity from "../../components/shared/SelectQuantity";
import SelectRentalDate from "../../components/shared/SelectRentalDate";
import {
  SVGAlertCircle,
  SVGCalendar,
  SVGCheck,
  SVGCreditCard,
  SVGPackage,
  SVGPhone,
  SVGUpload,
  SVGUser,
  SVGX,
} from "../../components/shared/SVGComponents";
import { getToken } from "../../helpers/GetToken";

// Data dummy untuk dropdown Jenis Sosial Media
const socialMediaOptions = [
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "Twitter", label: "Twitter (X)" },
  { value: "TikTok", label: "TikTok" },
  { value: "Lainnya", label: "Lainnya" },
];

// ===
// Helper SVG Components (Unchanged)
// ===

const Check = SVGCheck;
const AlertCircle = SVGAlertCircle;

const initialUnit = {
  unit_code: "",
  unit_name: "",
  photo: "",
  description: "",
  prices: [],
  variants: [],
};

// ===
// Main Component
// ===

const RentalForm = () => {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef(null);

  // === State Management ===
  const [currentStep, setCurrentStep] = useState(1); // NEW STATE FOR STEPPER
  const [unit, setUnit] = useState(initialUnit);
  const [selectedData, setSelectedData] = useState();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    nik: "",
    telp: "",
    email: "",
    address: "",
    closestContactName: "",
    closestContactTelp: "",
    socialMediaType: "",
    socialMediaUsername: "",
    ktpImage: "",
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
  const [isRepeat, setIsRepeat] = useState(false);

  useEffect(() => {
    const fetchVariantAvailability = async () => {
      if (!selectedVariant || !startDate || !endDate) return;
      try {
        const res = await axios.get(
          `${API_URL}/api/unit/catalog/${unit.unit_code}`,
          {
            params: {
              variant_unit_code: selectedVariant.variant_unit_code,
              start_date: startDate,
              end_date: endDate,
            },
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        if (res.data?.success) {
          const updatedUnit = res.data.data;

          const matchedVariant = updatedUnit.variants.find(
            (v) => v.variant_unit_code === selectedVariant.variant_unit_code,
          );

          if (matchedVariant) {
            setSelectedVariant(matchedVariant);

            // safety: qty user jangan lebih dari stok real
            if (quantity > matchedVariant.qty) {
              setQuantity(matchedVariant.qty > 0 ? matchedVariant.qty : 1);
            }
          }
        }
      } catch (err) {
        console.error("Gagal cek stok variant:", err);
      }
    };

    fetchVariantAvailability();
  }, [selectedVariant?.variant_unit_code, startDate, endDate]);

  useEffect(() => {
    if (!sessionStorage.getItem("selectedUnit")) {
      navigate("/unit");
    }

    setSelectedData(JSON.parse(sessionStorage.getItem("selectedUnit")));
  }, [navigate]);

  // ===
  // Fetch Data Unit (Unchanged)
  // ===
  const fetchUnitData = async () => {
    // ... (kode fetchUnitData tidak diubah)
    try {
      const unitCode = selectedData?.unitCode;
      if (!unitCode) return;

      const res = await axios.get(`${API_URL}/api/unit/catalog/${unitCode}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = res.data.data;
      console.log("data", data);

      const mappedUnit = {
        unit_code: data.unit_code,
        unit_name: data.unit_name,
        photo: data.photo,
        description: data.description,
        prices: data.prices || [],
        variants: data.variants || [],
        is_delete: data.is_delete,
        // only unit data needed; identity is always KTP so no requirement flags
      };
      setUnit(mappedUnit);

      setStartDate(selectedData?.startDate);
      setStartTime(selectedData?.startTime);
      setEndDate(selectedData?.endDate);
      setEndTime(selectedData?.endTime);

      console.log(mappedUnit);

      const activePrices =
        mappedUnit.prices?.filter(
          (p) => p.status === "Active" && p.is_delete === 0,
        ) || [];
      console.log(activePrices);
      if (activePrices.length > 0) setSelectedPrice(activePrices[0]);

      const vForm = JSON.parse(sessionStorage.getItem("selectedUnit"));

      if (vForm.unitVariant) {
        setSelectedVariant(vForm.unitVariant);
        setMainImage({
          id: vForm.unitVariant.variant_unit_code,
          src: vForm.unitVariant.photo,
        });
      } else if (mappedUnit.variants.length > 0) {
        setSelectedVariant(mappedUnit.variants[0]);
        setMainImage({
          id: mappedUnit.variants[0].variant_unit_code,
          src: mappedUnit.variants[0].photo,
        });
      } else {
        setMainImage({ id: mappedUnit.unit_code, src: mappedUnit.photo });
      }
    } catch (err) {
      console.log(err);
      retry;
    }
  };

  useEffect(() => {
    if (selectedData) {
      setStartDate(selectedData.startDate || "");
      setEndDate(selectedData.endDate || "");
    }
  }, [selectedData]);

  useEffect(() => {
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

  // ===
  // Derived State and Calculations (Unchanged)
  // ===
  const activePrices =
    unit.prices?.filter((p) => p.status === "Active" && p.is_delete === 0) ||
    [];
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
    !isDurationValid ||
    availableStock <= 0 ||
    quantity > availableStock;
  // ===
  // Handlers (Most Unchanged)
  // ===

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
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
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    }
    if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    // Validasi dataTransfer exists
    if (!e.dataTransfer) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validasi file type sebelum mengubah state
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          photo: "Foto harus jpg, png, atau webp",
        }));
        return;
      }

      // Validasi file size
      const maxSizeMB = 5;
      if (file.size / 1024 / 1024 > maxSizeMB) {
        setErrors((prev) => ({
          ...prev,
          photo: `Ukuran foto maksimal ${maxSizeMB}MB`,
        }));
        return;
      }

      handleImageChange(file);
    }
  };

  // ===
  // Validation and Step Navigation Logic
  // ===

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
      if (!formData.fullname) newErrors.fullname = "Nama lengkap wajib diisi.";
      if (!formData.telp || !/^\d{9,15}$/.test(formData.telp))
        newErrors.telp = "Nomor telepon tidak valid.";
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Alamat email tidak valid.";
      if (!formData.address) newErrors.address = "Alamat wajib diisi.";
      if (
        !formData.nik ||
        formData.nik.length !== 16 ||
        !/^\d+$/.test(formData.nik)
      )
        newErrors.nik = "NIK wajib diisi dan harus 16 digit angka.";
      if (!formData.closestContactName)
        newErrors.closestContactName = "Nama kontak terdekat wajib diisi.";
      if (
        !formData.closestContactTelp ||
        !/^\d{9,15}$/.test(formData.closestContactTelp)
      )
        newErrors.closestContactTelp =
          "Nomor telepon kontak terdekat tidak valid.";
      if (!formData.socialMediaType)
        newErrors.socialMediaType = "Jenis sosial media wajib dipilih.";
      if (!formData.socialMediaUsername)
        newErrors.socialMediaUsername = "Username sosial media wajib diisi.";

      isValid = Object.keys(newErrors).length === 0;
    }

    // Validation for Step 3 (Document) - KTP wajib (only KTP allowed)
    if (step === 3) {
      if (!isRepeat && !imageFile) {
        newErrors.photo = `Foto KTP wajib diunggah.`;
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
    setLoading(true);

    try {
      const token = await getToken();

      // =====================
      // 1. VALIDASI WAJIB
      // =====================
      if (!formData.nik) {
        setErrors({ nik: "NIK wajib diisi" });
        return;
      }

      if (!selectedVariant || !selectedPrice) {
        setErrors({ submit: "Unit / variant belum dipilih" });
        return;
      }

      if (!imageFile && !isRepeat) {
        setErrors({ photo: "Foto KTP wajib diunggah" });
        return;
      }

      // =====================
      // 2. CEK CUSTOMER BOLEH RENT?
      // =====================
      try {
        const checkRes = await axios.get(
          `${API_URL}/api/customer/nik/${formData.nik}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (checkRes.data?.data?.can_rent === false) {
          setErrors({
            submit:
              checkRes.data?.message ||
              "Customer tidak dapat meminjam saat ini",
          });
          return;
        }
      } catch (err) {
        if (err.response?.status === 409) {
          setErrors({
            submit: err.response.data?.message,
          });
          return;
        }
        throw err;
      }

      // =====================
      // 3. CREATE / UPDATE CUSTOMER
      // =====================
      const customerPayload = new FormData();
      customerPayload.append("nik", formData.nik);
      customerPayload.append("fullname", formData.fullname);
      customerPayload.append("telp", formData.telp);
      customerPayload.append("email", formData.email);
      customerPayload.append("address", formData.address);
      customerPayload.append("status", "Active");
      customerPayload.append(
        "closest_contact_name",
        formData.closestContactName,
      );
      customerPayload.append(
        "closest_contact_telp",
        formData.closestContactTelp,
      );
      customerPayload.append("social_media_type", formData.socialMediaType);
      customerPayload.append(
        "social_media_username",
        formData.socialMediaUsername,
      );
      customerPayload.append("photo", imageFile);

      const customerRes = await axios.post(
        `${API_URL}/api/customer`,
        customerPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const customer = customerRes.data?.data;
      if (!customer?.customer_id) {
        throw new Error("Gagal membuat customer");
      }

      // =====================
      // 4. CREATE RENT + DETAIL (SATU API)
      // =====================
      const totalPrice = selectedPrice.price_per_day * quantity * rentalDays;

      const rentPayload = {
        customer_id: customer.customer_id,
        nik: formData.nik,
        start_rent_date: `${startDate}T${startTime}:00`,
        end_rent_date: `${endDate}T${endTime}:00`,
        duration: rentalDays,
        total_price: totalPrice,
        total_paid: 0,
        created_by: formData.fullname || "SYSTEM",

        details: [
          {
            unit_code: unit.unit_code,
            variant_unit_code: selectedVariant.variant_unit_code,
            price: selectedPrice.price_per_day,
            qty: quantity,
          },
        ],
      };

      const rentRes = await axios.post(`${API_URL}/api/rental`, rentPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const rentData = rentRes.data?.data?.rent;
      if (!rentData?.rent_id) {
        throw new Error("Gagal membuat rental");
      }

      // =====================
      // 5. SEND EMAIL INVOICE
      // =====================
      const formatRupiah = (n) =>
        `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

      await axios.post(
        `${API_URL}/api/email/send-invoice-customer`,
        {
          email: formData.email,
          name: formData.fullname,
          address: formData.address,
          phone: formData.telp,
          invoice: rentData.invoice_number,
          unit: unit.unit_name,
          variant: selectedVariant.color || "-",
          duration: rentalDays,
          pricePerDay: formatRupiah(selectedPrice.price_per_day),
          subtotal: formatRupiah(totalPrice),
          paid: "Rp 0",
          remaining: formatRupiah(totalPrice),
          url: `https://sewaiphoneaja.bekasi/invoice/${rentData.invoice_number}`,
          date: new Date().toLocaleDateString("id-ID"),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // =====================
      // DONE
      // =====================
      setSubmissionSuccess(true);
      sessionStorage.removeItem("selectedUnit");
    } catch (err) {
      console.error(err);
      setErrors({
        submit:
          err.response?.data?.message || "Terjadi kesalahan saat pengajuan",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDataCustomerByNIK = async (nik) => {
    setErrors((prev) => ({ ...prev, submit: null }));

    try {
      const res = await axios.get(`${API_URL}/api/customer/nik/${nik}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      // THEN logic
      if (res.data.data.customer) {
        setIsRepeat(true);
        console.log(res.data.data.customer);
        setFormData((prev) => ({
          ...prev,
          fullname: res.data.data.customer.fullname || "",
          nik: res.data.data.customer.nik || "",
          telp: res.data.data.customer.telp || "",
          email: res.data.data.customer.email || "",
          address: res.data.data.customer.address || "",
          closestContactName: res.data.data.customer.closest_contact_name || "",
          closestContactTelp: res.data.data.customer.closest_contact_telp || "",
          socialMediaType: res.data.data.customer.social_media_type || "",
          socialMediaUsername:
            res.data.data.customer.social_media_username || "",
          ktpImage: res.data.data.customer.ktp_image || "",
        }));
        setImagePreview(
          res.data.data.customer.ktp_image
            ? `${API_URL}/get-image/${res.data.data.customer.ktp_image}`
            : null,
        );
      }
    } catch (err) {
      // CATCH logic
      if (
        err.response?.status === 409 ||
        err.response?.data?.error === "Conflict"
      ) {
        setErrors({
          submit:
            err.response.data?.message ||
            "Customer tidak dapat meminjam saat ini.",
        });
        console.log(errors);
      } else {
        console.error(err);
      }
    }
  };

  // ===
  // Step Content Rendering Function
  // ===
  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        // STEP 1: Unit Selection (Pilih Paket & Jadwal)
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-blue-900 px-6 py-4">
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
            <div className="bg-blue-900 px-6 py-4">
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
                    type="rawNumber"
                    value={formData.nik}
                    onChange={handleChange("nik")}
                    onBlur={() => {
                      fetchDataCustomerByNIK(formData.nik);
                    }}
                    disabled={isRepeat}
                    placeholder="16 digit NIK"
                    maxLength={16}
                    error={errors.nik}
                  />
                </div>

                <Input
                  label="Nama Lengkap"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange("fullname")}
                  disabled={isRepeat}
                  placeholder="Sesuai KTP"
                  error={errors.fullname}
                />

                <Input
                  label="Nomor Telepon"
                  name="telp"
                  value={formData.telp}
                  onChange={handleChange("telp")}
                  disabled={isRepeat}
                  placeholder="08xxxxxxxxxx"
                  maxLength={13}
                  type="rawNumber"
                  error={errors.telp}
                />

                <Input
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  disabled={isRepeat}
                  placeholder="email@contoh.com"
                  type="email"
                  error={errors.email}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Alamat Lengkap"
                    name="address"
                    value={formData.address}
                    onChange={handleChange("address")}
                    disabled={isRepeat}
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
                    name="closestContactName"
                    value={formData.closestContactName}
                    onChange={handleChange("closestContactName")}
                    disabled={isRepeat}
                    placeholder="Nama kerabat/teman"
                    error={errors.closestContactName}
                  />

                  <Input
                    label="Nomor Telepon Kontak Darurat"
                    name="closestContactTelp"
                    value={formData.closestContactTelp}
                    onChange={handleChange("closestContactTelp")}
                    disabled={isRepeat}
                    placeholder="08xxxxxxxxxx"
                    maxLength={13}
                    type="rawNumber"
                    error={errors.closestContactTelp}
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
                      disabled={isRepeat}
                      value={formData.socialMediaType || ""}
                      onChange={handleChange("socialMediaType")}
                      className={`block w-full border-2 rounded-lg shadow-sm 
                        focus:ring-2 focus:ring-blue-900 focus:border-blue-900 
                        p-3 text-sm font-medium transition-all ${
                          errors.socialMediaType
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                    >
                      <option value="" disabled>
                        Pilih Jenis Sosial Media
                      </option>

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
                    onChange={handleChange("socialMediaUsername")}
                    disabled={isRepeat}
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
            <div className="bg-blue-900 px-6 py-4">
              <div className="flex items-center gap-3">
                <SVGCreditCard className="w-6 h-6 text-white" size={24} />
                <h2 className="text-xl font-bold text-white">
                  Step 3: Upload Dokumen Identitas
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Upload Area */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Upload Foto KTP
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageChange(e.target.files[0])}
                  className="hidden"
                />

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
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative group rounded-xl overflow-hidden shadow-2xl border-2 border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-96 object-cover"
                      />

                      {!isRepeat && (
                        <>
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
                                <Check
                                  className="w-5 h-5 text-blue-600"
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
                        </>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                          flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg
                          ${
                            isRepeat
                              ? "bg-blue-900/60 text-white/60 cursor-not-allowed"
                              : "bg-blue-900 hover:bg-blue-800 text-white hover:shadow-xl cursor-pointer"
                          }
                        `}
                      >
                        Ganti Foto
                      </button>

                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={isRepeat}
                        className={`
                          px-6 py-3 rounded-xl text-sm font-bold transition-all border-2
                          ${
                            isRepeat
                              ? "bg-red-50 text-red-300 border-red-200 cursor-not-allowed"
                              : "bg-red-50 hover:bg-red-100 text-red-600 border-red-200 cursor-pointer"
                          }
                        `}
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
              {!isRepeat && (
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
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ===
  // Success Screen (Unchanged)
  // ===
  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-blue-200">
            {/* Icon Container */}
            <div className="mb-8 flex justify-center">
              <div className="bg-blue-600 rounded-full p-6 shadow-lg">
                <Check className="w-20 h-20 text-white" />
              </div>
            </div>

            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Berhasil! 🎉
            </h2>

            <p className="text-xl text-gray-700 mb-2 font-semibold">
              Pengajuan penyewaan{" "}
              <span className="text-blue-600">{unit.unit_name}</span> telah kami
              terima
            </p>

            <p className="text-gray-600 mb-10 max-w-lg mx-auto">
              Tim kami bakal proses dan hubungi kamu via email atau telepon
              dalam waktu 1×24 jam.
            </p>

            <ActionButton
              onClick={() => navigate("/unit")}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-xl transition-all px-12 py-4 text-lg font-bold rounded-2xl"
            >
              Tutup
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  // ===
  // Main Form Layout with Stepper
  // ===
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
                      ? "bg-blue-900 text-white ring-4 ring-blue-900/30"
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
    <div className="min-h-screen bg-gray-50">
      {/* Progress Steps / Stepper */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Stepper currentStep={currentStep} items={stepperItems} />
        </div>
      </div>

      <div className="max-w-screen mx-auto px-4 py-8">
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Gallery & Summary - Sticky */}
          <div className="w-full lg:w-1/3">
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
              <div className="bg-blue-900 rounded-2xl p-6 shadow-xl text-white">
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
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Render Current Step Content */}
            {renderStepContent(currentStep)}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-3 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold transition-all border border-gray-300 shadow-sm"
                >
                  Kembali
                </button>
              )}
              {currentStep === 1 && <div />}

              {currentStep < stepperItems.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isSewaDisabled && currentStep === 1}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all border shadow-sm ${
                    isSewaDisabled && currentStep === 1
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-900 hover:bg-blue-800 text-white"
                  }`}
                >
                  Lanjut Step {currentStep + 1} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || isSewaDisabled}
                  className={`w-full ${
                    loading || isSewaDisabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-900 via-blue-900 to-sky-900 hover:from-blue-700 hover:to-sky-700"
                  } text-white px-5 py-3 rounded-lg font-semibold text-base transition-all flex items-center justify-center gap-2`}
                >
                  {/* Spinner */}
                  {loading && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                  )}

                  {/* Teks Button */}
                  <span className="min-w-[140px] text-center">
                    {loading ? "Mengirim..." : "Kirim Pengajuan"}
                  </span>
                </button>
              )}
            </div>

            {currentStep === stepperItems.length && (
              <p className="text-xs text-center text-gray-500 mt-4">
                Dengan mengirim formulir, Anda menyetujui{" "}
                <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
                  syarat & ketentuan
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalForm;
