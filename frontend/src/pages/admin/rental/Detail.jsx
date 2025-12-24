"use client";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendar,
  faClock,
  faUser,
  faCreditCard,
  faBox,
  faImage,
  faChevronLeft,
  faChevronRight,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faIdCard,
  faUsers,
  faReceipt,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { getToken } from "../../../helpers/GetToken";
import DetailPaymentDialog from "../../../components/admin/DetailPaymentDialog";
import {
  formatCurrency,
  formatDate,
  formatTime,
} from "../../../helpers/Format";

// Helper SVG Components
const SVGLoader = ({ className, size = 20 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
    <path
      strokeWidth="4"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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

// const getStatusColor = (status) => {
//   switch (status) {
//     case "Open":
//       return "bg-blue-900";
//     case "Close":
//       return "bg-green-500";
//     case "OverDue":
//       return "bg-red-500";
//     case "Invalid":
//       return "bg-gray-500";
//     default:
//       return "bg-gray-500";
//   }
// };

const getStatusColor = (status) => {
  const lower = status.toLowerCase();

  if (lower.includes("waiting")) {
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

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "Paid":
      return "bg-green-50 text-green-700 border-green-200";
    case "Pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "Unpaid":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export default function RentalDetailPage() {
  const { rentId } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [rental, setRental] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [details, setDetails] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openDetail = (payment) => {
    console.log("Opening payment detail for:", payment);
    setSelectedPayment(payment);
    setShowDetail(true);

    console.log(selectedPayment);
    console.log(showDetail);
  };

  const handleApproveRental = async (rentId) => {
    if (!rentId) return;

    const confirmResult = await Swal.fire({
      title: "Approve Pengajuan?",
      text: "Pengajuan penyewaan akan disetujui dan status diubah menjadi Waiting Payment",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Approve",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const token = getToken();
      await axios.put(
        `${API_URL}/api/rental/${rentId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Pengajuan penyewaan telah disetujui.",
        showConfirmButton: false,
        timer: 2000,
      });

      // Update local rental state
      setRental((prev) => ({
        ...prev,
        status: "Waiting Payment",
        approval_date: new Date().toISOString(),
      }));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message || "Terjadi kesalahan saat approve.",
      });
    }
  };

  const handleRejectRental = async (rentId) => {
    if (!rentId) return;

    const { value: notes } = await Swal.fire({
      title: "Reject Pengajuan",
      input: "textarea",
      inputPlaceholder: "Masukkan alasan penolakan (opsional)...",
      showCancelButton: true,
      confirmButtonText: "Kirim",
      cancelButtonText: "Batal",
      inputAttributes: {
        "aria-label": "Alasan penolakan",
      },
    });

    if (notes === undefined) return; // canceled

    const confirmed = await Swal.fire({
      title: "Konfirmasi Reject",
      text: "Apakah Anda yakin ingin menolak pengajuan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Tolak",
      cancelButtonText: "Batal",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const token = getToken();
      await axios.put(
        `${API_URL}/api/rental/${rentId}/reject`,
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Pengajuan penyewaan telah ditolak.",
        showConfirmButton: false,
        timer: 2000,
      });

      // Update local rental state
      setRental((prev) => ({ ...prev, status: "Rejected Approval" }));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message || "Terjadi kesalahan saat reject.",
      });
    }
  };

  const handleCollectUnit = async (rentId) => {
    if (!rentId) return;

    const confirmResult = await Swal.fire({
      title: "Collect Unit?",
      text: "Unit akan ditandai sebagai sudah di-collect.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Collect",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const token = getToken();
      const res = await axios.put(
        `${API_URL}/api/rental/${rentId}/collect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Unit berhasil di-collect.",
        showConfirmButton: false,
        timer: 2000,
      });

      // update state lokal (biar tombol langsung berubah)
      setRental((prev) => ({
        ...prev,
        collect_date: res.data?.collect_date || new Date().toISOString(),
      }));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message || "Gagal collect unit.",
      });
    }
  };

  const handleReturnUnit = async (rentId) => {
    if (!rentId) return;

    const confirmResult = await Swal.fire({
      title: "Return Unit?",
      text: "Unit akan dikembalikan dan status diset ke Close.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Return",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const token = getToken();
      const res = await axios.put(
        `${API_URL}/api/rental/${rentId}/return`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Unit berhasil dikembalikan.",
        showConfirmButton: false,
        timer: 2000,
      });

      setRental((prev) => ({
        ...prev,
        status: "Close",
        return_date: res.data?.return_date || new Date().toISOString(),
      }));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message || "Gagal return unit.",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!rentId || !API_URL) return;

      try {
        const token = getToken();
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }

        // Fetch rental, detail, dan payment secara parallel untuk lebih efisien
        const [rentalRes] = await Promise.all([
          axios.get(`${API_URL}/api/rental/${rentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const rentalData = rentalRes.data.data;

        setRental(rentalData);
        setDetails(rentalData.details || []);
        setPayments(rentalData.payments || []);

        // Fetch customer data setelah rental data siap
        if (rentalData?.customer_id) {
          try {
            const customerRes = await axios.get(
              `${API_URL}/api/customer/${rentalData.customer_id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setCustomer(customerRes.data.data);
          } catch (customerErr) {
            console.error("Error fetching customer:", customerErr);
            // Lanjutkan tanpa data customer
          }
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Gagal memuat data rental. Silakan coba lagi."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rentId, API_URL, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SVGLoader className="w-16 h-16 text-blue-900 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 font-medium">Memuat data rental...</p>
        </div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
            <SVGAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Terjadi Kesalahan
            </p>
            <p className="text-gray-600 mb-6">
              {error || "Data tidak ditemukan"}
            </p>
            <button
              onClick={() => navigate("/menu/rental")}
              className="bg-blue-900 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Kembali ke Daftar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rentalDays =
    rental.end_rent_date && rental.start_rent_date
      ? Math.ceil(
          (new Date(rental.end_rent_date) - new Date(rental.start_rent_date)) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // Calculate total from details
  const totalPriceFromDetails = details.reduce(
    (sum, d) => sum + (d.subtotal || 0),
    0
  );

  const handlePrevImage = () => {
    setMainImageIndex((prev) =>
      prev === 0 ? Math.max(0, details.length - 1) : prev - 1
    );
  };

  const handleNextImage = () => {
    setMainImageIndex((prev) => (prev === details.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/menu/rental")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors font-medium text-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            Kembali ke Daftar Rental
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Detail Penyewaan
                </h1>
                <p className="text-sm text-blue-900 font-bold">
                  {rental.invoice_number}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`${getStatusColor(
                    rental.status
                  )} px-4 py-2 rounded-lg inline-flex items-center justify-center self-start sm:self-auto`}
                >
                  <p className="font-semibold text-sm">{rental.status}</p>
                </div>

                {/* Show approve/reject only when waiting approval */}
                {rental.status === "Waiting Approval" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveRental(rental?.rent_id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-all shadow-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRental(rental?.rent_id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-all shadow-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {rental.status === "Open" &&
                  (rental.collect_date === null ? (
                    <button
                      onClick={() => handleCollectUnit(rental?.rent_id)}
                      className="bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-sm"
                    >
                      Collect Unit
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReturnUnit(rental?.rent_id)}
                      className="bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-sm"
                    >
                      Return Unit
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Gallery & Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Gallery Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden group">
                {details && details.length > 0 ? (
                  <>
                    <img
                      src={`${API_URL}/get-image/${details[mainImageIndex]?.variant_photo}`}
                      alt="Unit"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {details.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition-all"
                        >
                          <FontAwesomeIcon
                            icon={faChevronLeft}
                            className="text-gray-900 w-4 h-4"
                          />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition-all"
                        >
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-gray-900 w-4 h-4"
                          />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                      {mainImageIndex + 1} / {details.length}
                    </div>
                  </>
                ) : (
                  <FontAwesomeIcon
                    icon={faImage}
                    className="w-16 h-16 text-gray-400"
                  />
                )}
              </div>

              {details.length > 0 && (
                <div className="p-5 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FontAwesomeIcon
                        icon={faBox}
                        className="text-blue-900 w-4 h-4"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Informasi Unit
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Nama Unit</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {details[mainImageIndex]?.unit_name ||
                          details[mainImageIndex]?.unit_code}
                      </p>
                    </div>
                    {details[mainImageIndex]?.variant_name && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Varian</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {details[mainImageIndex]?.variant_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-blue-900 rounded-xl shadow-sm text-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faReceipt} className="w-5 h-5" />
                <h3 className="text-base font-semibold">Ringkasan Harga</h3>
              </div>

              {details.length > 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm bg-white/10 p-3 rounded-lg"
                      >
                        <span className="text-white/90">
                          {detail.qty}x {detail.unit_code}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(detail.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/20 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/90">Durasi</span>
                      <span className="font-semibold">{rentalDays} hari</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold">
                        {formatCurrency(totalPriceFromDetails)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    className="text-green-600 w-4 h-4"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Status Pembayaran
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Total Harga</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(rental.total_price)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Sudah Dibayar</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(rental.total_paid)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">
                    Sisa Bayar
                  </span>
                  <span className="text-lg font-bold text-blue-900">
                    {formatCurrency(rental.balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-900 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-white w-5 h-5"
                  />
                  <h3 className="text-base font-semibold text-white">
                    Data Customer
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-gray-400 w-3.5 h-3.5"
                      />
                      <p className="text-xs text-gray-500 font-medium">
                        Nama Lengkap
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {customer?.fullname || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon
                        icon={faIdCard}
                        className="text-gray-400 w-3.5 h-3.5"
                      />
                      <p className="text-xs text-gray-500 font-medium">NIK</p>
                    </div>
                    <p className="text-sm font-mono text-gray-900">
                      {customer?.nik || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="text-gray-400 w-3.5 h-3.5"
                      />
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                    </div>
                    <p className="text-sm text-gray-900 break-all">
                      {customer?.email || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="text-gray-400 w-3.5 h-3.5"
                      />
                      <p className="text-xs text-gray-500 font-medium">
                        Telepon
                      </p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {customer?.telp || "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-gray-400 w-3.5 h-3.5"
                      />
                      <p className="text-xs text-gray-500 font-medium">
                        Alamat
                      </p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {customer?.address || "-"}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="md:col-span-2 border-t border-gray-200 my-2"></div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="text-gray-400 w-3.5 h-3.5"
                      />
                      <p className="text-xs text-gray-500 font-medium">
                        Kontak Terdekat
                      </p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {customer?.closest_contact_name || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="text-gray-400 w-3.5 h-3.5"
                      />
                      <p className="text-xs text-gray-500 font-medium">
                        Telepon Kontak
                      </p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {customer?.closest_contact_telp || "-"}
                    </p>
                  </div>

                  {/* Action buttons moved to header */}
                </div>
              </div>
            </div>

            {/* Rental Period */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-900 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="text-white w-5 h-5"
                  />
                  <h3 className="text-base font-semibold text-white">
                    Periode Penyewaan
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Tanggal Mulai
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {formatDate(rental.start_rent_date)}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                      {formatTime(rental.start_rent_date)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Tanggal Selesai
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {formatDate(rental.end_rent_date)}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                      {formatTime(rental.end_rent_date)}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs text-blue-900 mb-2 font-semibold">
                      Durasi Total
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {rentalDays}
                    </p>
                    <p className="text-xs text-blue-900 font-medium">Hari</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Units */}
            {details.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-900 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faBox}
                      className="text-white w-5 h-5"
                    />
                    <h3 className="text-base font-semibold text-white">
                      Detail Unit
                    </h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">
                            Nama Unit
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {detail.unit_name || detail.unit_code}
                          </p>
                        </div>
                        {detail.variant_name && (
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Varian</p>
                            <p className="text-base font-semibold text-gray-900">
                              {detail.variant_name}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">
                            Harga/Hari
                          </p>
                          <p className="text-sm font-bold text-blue-900">
                            {formatCurrency(detail.price)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Qty</p>
                          <p className="text-sm font-bold text-gray-900">
                            {detail.qty} Unit
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                          <p className="text-sm font-bold text-green-600">
                            {formatCurrency(detail.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-900 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    className="text-white w-5 h-5"
                  />
                  <h3 className="text-base font-semibold text-white">
                    Riwayat Pembayaran
                  </h3>
                </div>
              </div>
              <div className="p-6">
                {payments && payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-4"
                      >
                        {/* CARD */}
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  {payment.payment_id}
                                </span>
                                <span
                                  className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getPaymentStatusColor(
                                    payment.status
                                  )}`}
                                >
                                  {payment.status}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <FontAwesomeIcon
                                    icon={faCalendar}
                                    className="w-3 h-3"
                                  />
                                  {formatDate(payment.payment_date)}{" "}
                                  {formatTime(payment.payment_date)}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <FontAwesomeIcon
                                    icon={faCreditCard}
                                    className="w-3 h-3"
                                  />
                                  {payment.payment_method || "-"}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    className="w-3 h-3"
                                  />
                                  {payment.updated_by || "-"}
                                </div>
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-xs text-gray-500 mb-1">
                                Jumlah Bayar
                              </p>
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(payment.total_payment)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* TOMBOL TENGAH KANAN */}
                        <button
                          onClick={() => openDetail(payment)}
                          className="text-xs px-3 py-1.5 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition shrink-0"
                        >
                          Detail
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FontAwesomeIcon
                        icon={faCreditCard}
                        className="text-gray-400 w-8 h-8"
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Belum ada pembayaran
                    </p>
                    <p className="text-xs text-gray-500">
                      Riwayat pembayaran akan ditampilkan di sini
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-900 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-white w-5 h-5"
                  />
                  <h3 className="text-base font-semibold text-white">
                    Informasi Tambahan
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Dibuat Oleh
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {rental.created_by || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Tanggal Dibuat
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(rental.created_at) || "-"}
                    </p>
                  </div>
                  {rental.approval_date && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Disetujui Oleh
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {rental.approval_by || "-"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Tanggal Persetujuan
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(rental.approval_date) || "-"}
                        </p>
                      </div>
                    </>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Tanggal Pengambilan
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(rental.collect_date) || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Tanggal Pengembalian
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(rental.return_date) || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DetailPaymentDialog
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        payment={selectedPayment}
        onSuccess={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
}
