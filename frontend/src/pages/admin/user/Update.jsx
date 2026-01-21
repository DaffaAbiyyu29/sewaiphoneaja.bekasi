"use client";
import {
  faCheck,
  faCircleExclamation,
  faFloppyDisk,
  faUpload,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../../components/shared/Input";
import { getToken } from "../../../helpers/GetToken";
import { getUserInfo } from "../../../helpers/GetUserInfo";

const API_URL = import.meta.env.VITE_API_URL;

export default function UpdateUserPage() {
  const [formData, setFormData] = useState({
    nik: "",
    name: "",
    role: "",
    email: "",
    password: "",
    retype_password: "",
    telp: "",
    address: "",
    gender: "",
    birth_place: "",
    birth_date: "",
    created_by: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({ success: null, message: "" });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // route params & navigation
  const { nik } = useParams();
  const navigate = useNavigate();

  // track whether admin wants to change password
  const [changePassword, setChangePassword] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === "duration" || field === "price_per_day") {
      // Pastikan value adalah angka dan minimal 0 atau 1 untuk duration
      value = Math.max(field === "duration" ? 1 : 0, Number(value));
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageChange = (file) => {
    setResponse({ success: null, message: "" });
    setErrors((prev) => ({ ...prev, photo: "" }));
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: "Hanya file JPG/PNG/WEBP yang diizinkan.",
      }));
      return setResponse({
        success: false,
        message: "Hanya file JPG/PNG/WEBP yang diizinkan.",
      });
    }

    const maxSizeMB = 5;
    if (file.size / 1024 / 1024 > maxSizeMB) {
      setErrors((prev) => ({
        ...prev,
        photo: `Ukuran maksimum ${maxSizeMB}MB.`,
      }));
      return setResponse({
        success: false,
        message: `Ukuran maksimum ${maxSizeMB}MB.`,
      });
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

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResponse({ success: null, message: "" });
    setErrors((prev) => ({ ...prev, photo: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // fetch existing user data
  useEffect(() => {
    if (!nik) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/${nik}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = res.data.data;
        setUserId(data.user_id || null);
        setFormData((prev) => ({
          ...prev,
          nik: data.nik || "",
          name: data.name || "",
          role: data.role || "",
          email: data.email || "",
          telp: data.telp || "",
          address: data.address || "",
          gender: data.gender || "",
          birth_place: data.birth_place || "",
          birth_date: data.birth_date ? data.birth_date.split("T")[0] : "",
          password: "",
          retype_password: "",
        }));
        if (data.profile_picture) {
          setImagePreview(`${API_URL}/get-image/${data.profile_picture}`);
          setImageFile(null);
        }
      } catch (err) {
        console.error(err);
        setResponse({ success: false, message: "Gagal mengambil data user." });
      }
    };

    fetchUser();
  }, [nik]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse({ success: null, message: "" });

    // validation
    const newErrors = {};
    if (!formData.nik) newErrors.nik = "NIK wajib diisi.";
    if (formData.nik.length !== 16)
      newErrors.nik = "NIK harus terdiri dari 16 karakter.";
    if (!formData.name) newErrors.name = "Nama wajib diisi.";
    if (!formData.role) newErrors.role = "Role wajib dipilih.";
    if (!formData.email) newErrors.email = "Email wajib diisi.";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Format email tidak valid.";
    // validate password only if admin chooses to change it
    if (changePassword) {
      if (!formData.password) newErrors.password = "Password wajib diisi.";
      if (!formData.retype_password)
        newErrors.retype_password = "Retype Password wajib diisi.";
      if (
        formData.password &&
        formData.retype_password &&
        formData.password !== formData.retype_password
      )
        newErrors.retype_password = "Password tidak cocok.";
    }

    if (!formData.telp) newErrors.telp = "Telp wajib diisi.";
    if (!formData.gender) newErrors.gender = "Gender wajib dipilih.";
    if (!formData.birth_place)
      newErrors.birth_place = "Tempat lahir wajib diisi.";
    if (!formData.birth_date)
      newErrors.birth_date = "Tanggal lahir wajib diisi.";
    if (!formData.address) newErrors.address = "Alamat wajib diisi.";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setResponse({
        success: false,
        message: "Mohon lengkapi semua kolom yang wajib.",
      });
      setLoading(false);
      return;
    }

    try {
      const user = getUserInfo();

      const payload = new FormData();
      // backend expects a user_id param in body for updateUser
      if (userId) payload.append("user_id", userId);
      payload.append("nik", formData.nik);
      payload.append("name", formData.name);
      payload.append("role", formData.role);
      payload.append("email", formData.email || "");
      if (changePassword && formData.password)
        payload.append("password", formData.password);
      payload.append("telp", formData.telp || "");
      payload.append("address", formData.address || "");
      payload.append("gender", formData.gender || "");
      payload.append("birth_place", formData.birth_place || "");
      payload.append("birth_date", formData.birth_date || "");
      payload.append("updated_by", user?.name || "");
      if (imageFile) payload.append("photo", imageFile);

      const res = await axios.put(`${API_URL}/api/user/${nik}`, payload, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (res?.data?.success) {
        setResponse({ success: true, message: "User berhasil diperbarui." });
        setTimeout(() => navigate(`/menu/user`), 1200);
      } else {
        setResponse({
          success: false,
          message: res?.data?.message || "Gagal memperbarui user.",
        });
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        setResponse({
          success: false,
          message: err.response.data.message || "Gagal membuat user.",
        });
      } else if (err.request) {
        setResponse({
          success: false,
          message: "Tidak dapat terhubung ke server (Network/CORS).",
        });
      } else {
        setResponse({ success: false, message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  // determine allowed role options based on logged-in user's role
  const currentUser = getUserInfo();
  const ROLE_OPTIONS = (() => {
    const r = currentUser?.role;
    if (!r) return ["Admin", "Manager", "Supervisor"];
    if (r === "Supervisor") return ["Admin"]; // supervisor may only set Admin
    if (r === "Manager") return ["Admin", "Manager", "Supervisor"];
    return ["Admin"];
  })();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faUser} className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ubah User</h1>
              <p className="text-gray-600 text-sm mt-1">
                {`Perbarui data user. Centang opsi "Ubah Password" untuk mengganti
                kata sandi.`}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
            {/* Photo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Foto Profil
              </label>

              {!imagePreview ? (
                <div
                  className={`border-2 border-dashed rounded-xl transition-all ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
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
                      className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                    >
                      Pilih File
                    </button>
                    <p className="text-xs text-gray-400 mt-3">
                      PNG, JPG, WEBP hingga 5MB
                    </p>
                    {errors.photo && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.photo}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Fields */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={
                      <>
                        <span>NIK</span> <span className="text-red-500">*</span>
                      </>
                    }
                    maxLength={16}
                    value={formData.nik}
                    onChange={handleChange("nik")}
                    required
                    placeholder="NIK"
                    error={errors.nik}
                    disabled={true}
                  />
                </div>

                <div>
                  <Input
                    label={
                      <>
                        <span>Nama</span>{" "}
                        <span className="text-red-500">*</span>
                      </>
                    }
                    maxLength={100}
                    value={formData.name}
                    onChange={handleChange("name")}
                    required
                    placeholder="Nama lengkap"
                    error={errors.name}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={
                      <>
                        <span>Email</span>{" "}
                        <span className="text-red-500">*</span>
                      </>
                    }
                    maxLength={100}
                    type="text"
                    value={formData.email}
                    onChange={handleChange("email")}
                    placeholder="Email"
                    error={errors.email}
                  />
                </div>

                <div className="mt-6">
                  <div className="flex items-center mb-3">
                    <input
                      id="changePassword"
                      type="checkbox"
                      checked={changePassword}
                      onChange={(e) => {
                        setChangePassword(e.target.checked);
                        // clear password fields and errors when unchecked
                        if (!e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            password: "",
                            retype_password: "",
                          }));
                          setErrors((prev) => ({
                            ...prev,
                            password: "",
                            retype_password: "",
                          }));
                        }
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    <label
                      htmlFor="changePassword"
                      className="text-sm font-medium"
                    >
                      Ubah Password
                    </label>
                  </div>

                  {changePassword ? (
                    <>
                      <Input
                        label={<span>Password</span>}
                        type="password"
                        maxLength={100}
                        value={formData.password}
                        onChange={handleChange("password")}
                        placeholder="Password baru"
                        showPasswordToggle
                        error={errors.password}
                      />

                      <div className="mt-3">
                        <Input
                          label={<span>Retype Password</span>}
                          type="password"
                          maxLength={100}
                          value={formData.retype_password}
                          onChange={handleChange("retype_password")}
                          placeholder="Ketik ulang password baru"
                          showPasswordToggle
                          error={errors.retype_password}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Kata sandi tidak akan diubah.
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange("role")}
                    className={`w-full rounded-xl px-4 py-3 pr-12 text-gray-900 bg-white shadow-sm border ${
                      errors.role
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-900"
                    } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 appearance-none`}
                  >
                    <option value="" disabled>
                      Pilih Role
                    </option>
                    {Array.from(new Set([formData.role, ...ROLE_OPTIONS])).map(
                      (r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ),
                    )}
                  </select>

                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={
                      <>
                        <span>Telp</span>{" "}
                        <span className="text-red-500">*</span>
                      </>
                    }
                    maxLength={13}
                    value={formData.telp}
                    onChange={handleChange("telp")}
                    placeholder="No. Telp"
                    error={errors.telp}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange("gender")}
                    className={`w-full rounded-xl px-4 py-3 pr-12 text-gray-900 bg-white shadow-sm border ${
                      errors.gender
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-900"
                    } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 appearance-none`}
                  >
                    <option value="" disabled>
                      Pilih Gender
                    </option>
                    <option value="M">Laki-laki</option>
                    <option value="F">Perempuan</option>
                  </select>

                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={
                      <>
                        <span>Tempat Lahir</span>{" "}
                        <span className="text-red-500">*</span>
                      </>
                    }
                    maxLength={100}
                    value={formData.birth_place}
                    onChange={handleChange("birth_place")}
                    placeholder="Kota"
                    error={errors.birth_place}
                  />
                </div>

                <div>
                  <Input
                    label={
                      <>
                        <span>Tanggal Lahir</span>{" "}
                        <span className="text-red-500">*</span>
                      </>
                    }
                    maxLength={10}
                    type="date"
                    value={formData.birth_date}
                    onChange={handleChange("birth_date")}
                    error={errors.birth_date}
                  />
                </div>
              </div>

              <div>
                <Input
                  label={
                    <>
                      <span>Alamat</span>{" "}
                      <span className="text-red-500">*</span>
                    </>
                  }
                  type="textarea"
                  value={formData.address}
                  onChange={handleChange("address")}
                  rows={3}
                  placeholder="Alamat lengkap"
                  error={errors.address}
                />
              </div>
            </div>
          </div>

          {/* response */}
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
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                  <FontAwesomeIcon
                    icon={faCircleExclamation}
                    className="text-white text-lg"
                  />
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

          <div className="bg-gray-50 px-8 py-6 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.history.back()}
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
                  : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
              } text-white px-8 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2`}
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    ></circle>
                    <path
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    ></path>
                  </svg>
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
  );
}
