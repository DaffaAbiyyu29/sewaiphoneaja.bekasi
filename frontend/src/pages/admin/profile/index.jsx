// src/pages/ProfileUserPage.jsx
import {
  faBriefcase,
  faClock,
  faEdit,
  faEnvelope,
  faIdCard,
  faSave, // Untuk tombol simpan
  faTimes,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "animate.css";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Avatar from "../../../components/Avatar";
import Input from "../../../components/Input";
import { formatDate } from "../../../helpers/Format";
import { getToken } from "../../../helpers/GetToken";
import { getUserInfo } from "../../../helpers/GetUserInfo";

export default function ProfileUserPage() {
  const [userData, setUserData] = useState(null);
  const [formEditData, setFormEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const user = getUserInfo();
      const token = getToken();

      const response = await axios.get(`${API_URL}/api/user/${user.nik}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUserData(response.data.data);
        setFormEditData(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal memuat data profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Jika mode edit dimatikan, kembalikan data edit ke data awal
      setFormEditData(userData);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setFormEditData((prevData) => ({
      ...prevData,
      photo: imageFile,
    }));
    try {
      const token = getToken();

      const userPayload = new FormData();

      userPayload.append("user_id", formEditData.user_id || "");
      userPayload.append("nik", formEditData.nik || "");
      userPayload.append("name", formEditData.name || "");
      userPayload.append("email", formEditData.email || "");
      userPayload.append("telp", formEditData.telp || "");
      userPayload.append("address", formEditData.address || "");
      userPayload.append("gender", formEditData.gender || "");
      userPayload.append("birth_place", formEditData.birth_place || "");
      userPayload.append("birth_date", formEditData.birth_date || "");
      userPayload.append("status", formEditData.status || "active");

      userPayload.append("created_at", formEditData.created_at || "");
      userPayload.append("created_by", formEditData.created_by || "");
      userPayload.append("updated_at", new Date().toISOString());
      userPayload.append("updated_by", formEditData.updated_by || "");

      // handle foto
      if (imageFile) {
        userPayload.append("profile_picture", imageFile.name);
        userPayload.append("photo", imageFile);
      } else {
        userPayload.append(
          "profile_picture",
          formEditData.profile_picture || ""
        );
        userPayload.append("photo", "");
      }

      await axios.put(`${API_URL}/api/user/${userData.nik}`, userPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Mock success: Update userData state dengan formEditData
      setUserData(formEditData);
      setIsEditing(false);

      let timerInterval;

      Swal.fire({
        title: "Berhasil memperbarui data",
        icon: "success",
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 2000,

        html: `
          <div class="swal-loader">
            <div class="swal-loader-bar" id="swal-loader-bar"></div>
          </div>
        `,

        customClass: {
          popup: "rounded-swal",
        },

        didOpen: () => {
          const bar = document.getElementById("swal-loader-bar");
          let start = Date.now();
          const duration = 2000;

          timerInterval = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min((elapsed / duration) * 100, 100);
            bar.style.width = progress + "%";
          }, 16);
        },

        willClose: () => {
          clearInterval(timerInterval);
        },

        showClass: {
          popup: "animate__animated animate__fadeInDown",
          backdrop: "animate__animated animate__fadeIn",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
          backdrop: "animate__animated animate__fadeOut",
        },
      }).then(() => {
        window.location.reload();
      });
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      //setError(err.response?.data?.message || "Gagal menyimpan perubahan");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (file) => {
    if (!file) {
      removeImage();
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Foto harus jpg, png, atau webp");
      removeImage();
      return;
    }

    const maxSizeMB = 5;
    if (file.size / 1024 / 1024 > maxSizeMB) {
      setError(`Ukuran foto maksimal ${maxSizeMB}MB`);
      removeImage();
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "-";
    // Menggunakan formatDate dari helper, dengan opsi detail jam
    return formatDate(datetime, {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  // Komponen pembantu untuk menampilkan item detail (Editable atau Statis)
  const DetailItem = ({
    icon,
    label,
    name,
    value,
    isEditing,
    type = "text",
    options = [],
    isMultiline = false,
  }) => (
    <div className="flex items-start space-x-4">
      <div className="pt-1 text-gray-400">
        <FontAwesomeIcon icon={icon} size="lg" />
      </div>
      <div className="w-full">
        {isEditing ? (
          // === MODE EDIT: Menggunakan komponen Input kustom ===
          type === "select" ? (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <select
                name={name}
                value={value}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-3 shadow-sm border border-gray-300 focus:ring-blue-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Input
              label={label}
              type={isMultiline ? "textarea" : type}
              value={value}
              onChange={(e) =>
                handleChange({ target: { name, value: e.target.value } })
              }
              placeholder={`Masukkan ${label.toLowerCase()}`}
              maxLength={name === "address" ? 500 : 255}
            />
          )
        ) : (
          // === MODE VIEW (STATIS) ===
          <div>
            <label className="text-sm font-medium text-gray-500">{label}</label>
            <p className="text-gray-900 font-semibold break-words whitespace-pre-wrap">
              {type === "date"
                ? formatDate(value, { dateStyle: "long" })
                : value || "-"}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // --- ProfilePictureModal telah dipindahkan ke src/components/ProfilePictureModal.jsx ---
  // Hapus definisi ProfilePictureModal di sini

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data profile...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-red-200">
          <div className="text-red-500 text-5xl mb-4">
            <FontAwesomeIcon icon={faIdCard} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUserData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Data tidak ditemukan.</p>
      </div>
    );
  }

  const displayData = isEditing ? formEditData : userData;
  const isDataSame = JSON.stringify(userData) === JSON.stringify(formEditData);
  const hasNewImage = imagePreview !== null;
  const isDisabled = isDataSame && !hasNewImage;

  // --- MAIN CONTENT ---
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* === HEADER CARD DAN AKSI === */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 p-6 relative">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FontAwesomeIcon icon={faUser} className="text-blue-600 mr-3" />
              Profile Pengguna
            </h1>

            {isEditing ? (
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                {/* SIMPAN */}
                <button
                  onClick={handleSave}
                  disabled={isDisabled}
                  className={`
                    px-4 py-2 rounded-xl flex items-center justify-center gap-2
                    text-sm font-medium w-full md:w-28
                    transition-all duration-200
                    ${
                      isDisabled
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-green-600 text-white shadow-md shadow-green-600/30 hover:bg-green-700 hover:shadow-lg hover:shadow-green-700/40 active:scale-95"
                    }
                  `}
                >
                  <FontAwesomeIcon icon={faSave} size="sm" />
                  Simpan
                </button>

                {/* BATAL */}
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium w-full md:w-28 bg-gray-100 text-gray-700 shadow-md hover:bg-gray-200 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faTimes} size="sm" />
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium bg-blue-900 text-white shadow-md hover:bg-blue-800 transition-all duration-200 active:scale-95"
              >
                <FontAwesomeIcon icon={faEdit} size="1x" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start">
            {/* Profile Picture & Inisial/Foto (Kiri) */}
            <div className="relative mb-6 md:mb-0 md:mr-8 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg overflow-hidden bg-gray-200">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={displayData.name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : displayData?.profile_picture ? (
                  <Avatar
                    image={displayData.profile_picture}
                    name={displayData.name}
                    size={"full"}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-900 text-white text-5xl font-extrabold">
                    {displayData?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>

              {/* Tombol Lihat Foto/Ganti Foto (Hanya muncul jika ada foto) */}
              {displayData?.profile_picture && isEditing && (
                <button
                  // Jika mode edit, tampilkan alert. Jika mode view, buka modal.
                  onClick={() => fileInputRef.current?.click()}
                  title={isEditing ? "Ganti Foto Profil" : "Lihat Foto Profil"}
                  className="absolute bottom-1 right-1 bg-white text-blue-600 p-2 rounded-full shadow-xl border border-gray-100 hover:bg-blue-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faEdit} size="1x" />
                </button>
              )}
            </div>

            {/* Nama, NIK, dan Status (Kanan) */}
            <div className="text-center md:text-left flex-1 w-full">
              {isEditing ? (
                <Input
                  type="text"
                  name="name"
                  value={displayData?.name || ""}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "name", value: e.target.value },
                    })
                  }
                  placeholder="Nama Lengkap"
                  maxLength={100}
                />
              ) : (
                <p className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
                  {displayData?.name}
                </p>
              )}
              {/* NIK dan Status Sejajar */}
              <div className="flex items-center justify-center md:justify-start flex-wrap mt-6 md:mt-3 gap-x-4 gap-y-2">
                <p className="text-gray-500 text-sm flex items-center">
                  <FontAwesomeIcon
                    icon={faIdCard}
                    className="mr-2 text-blue-500"
                  />
                  <span className="font-semibold text-gray-800">NIK:</span>
                  <span className="font-mono ml-2 text-lg">
                    {displayData?.nik}
                  </span>
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                    displayData?.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {displayData?.status === "Active" ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-500">
                {displayData?.role}
              </p>
            </div>
          </div>
        </div>

        {/* === DETAIL INFORMASI (2 KOLOM) === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KOLOM KIRI: Personal & System */}
          <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3 flex items-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-orange-500 mr-3"
                />
                Informasi Personal
              </h2>
              <div
                className={`space-y-6 ${
                  isEditing
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                    : "space-y-5"
                }`}
              >
                {/* Jenis Kelamin */}
                <div className={isEditing ? "col-span-1" : "col-span-2"}>
                  <DetailItem
                    label="Jenis Kelamin"
                    name="gender"
                    value={
                      displayData?.gender === "M"
                        ? "Laki-laki"
                        : displayData?.gender === "F"
                        ? "Perempuan"
                        : "-"
                    }
                    isEditing={isEditing}
                    type="select"
                    options={[
                      { value: "M", label: "Laki-laki" },
                      { value: "F", label: "Perempuan" },
                    ]}
                  />
                </div>

                {/* Tempat Lahir */}
                <div className={isEditing ? "col-span-1" : "col-span-2"}>
                  <DetailItem
                    label="Tempat Lahir"
                    name="birth_place"
                    value={displayData?.birth_place}
                    isEditing={isEditing}
                  />
                </div>

                {/* Tanggal Lahir */}
                <div className={isEditing ? "col-span-1" : "col-span-2"}>
                  <DetailItem
                    label="Tanggal Lahir"
                    name="birth_date"
                    value={displayData?.birth_date} // YYYY-MM-DD
                    isEditing={isEditing}
                    type="date"
                  />
                </div>
                <div></div>
              </div>
            </div>

            {/* System Information Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3 flex items-center">
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className="text-purple-500 mr-3"
                />
                Informasi Sistem
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500 flex items-center">
                    <FontAwesomeIcon
                      icon={faClock}
                      size="sm"
                      className="mr-2"
                    />
                    Dibuat Pada
                  </label>
                  <p className="text-gray-900 font-medium text-sm">
                    {formatDateTime(userData?.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Dibuat Oleh</label>
                  <p className="text-gray-900 font-medium text-sm">
                    {userData?.created_by || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 flex items-center">
                    <FontAwesomeIcon
                      icon={faClock}
                      size="sm"
                      className="mr-2"
                    />
                    Diperbarui Pada
                  </label>
                  <p className="text-gray-900 font-medium text-sm">
                    {formatDateTime(userData?.updated_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Diperbarui Oleh
                  </label>
                  <p className="text-gray-900 font-medium text-sm">
                    {userData?.updated_by || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky lg:top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3 flex items-center">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-red-500 mr-3"
                />
                Informasi Kontak
              </h2>
              <div className="space-y-6">
                {/* Email */}
                <DetailItem
                  label="Email"
                  name="email"
                  value={displayData?.email}
                  isEditing={isEditing}
                  type="email"
                />

                {/* Nomor Telepon */}
                <DetailItem
                  label="Nomor Telepon"
                  name="telp"
                  value={displayData?.telp}
                  isEditing={isEditing}
                  type="tel"
                />

                {/* Alamat (Menggunakan isMultiline=true untuk Input/Textarea) */}
                <DetailItem
                  label="Alamat"
                  name="address"
                  value={displayData?.address}
                  isEditing={isEditing}
                  isMultiline={true}
                />
                <div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Input file untuk memilih foto */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleImageChange(e.target.files[0])}
          className="hidden"
          ref={fileInputRef}
        />
      </div>
    </div>
  );
}
