import { useState } from "react";
import Input from "../../components/Input";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  // /*global process*/
  // /*eslint no-undef: "error"*/
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } wajib diisi`;
      }
      if (key === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[key] = "Format email tidak valid";
        }
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/login`, {
        email: form.email,
        password: form.password,
      });

      // berhasil login
      // console.log("Response:", response.data);

      // simpan token ke localStorage
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token);
      }

      alert("Login berhasil!");
      navigate("/dashboard"); // <-- pakai navigate, bukan Route()
    } catch (err) {
      console.error(err);
      if (err.response) {
        alert(err.response.data.message || "Login gagal");
      } else {
        alert("Server tidak merespon");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/images/sewaiphoneaja.png"
            alt="Sewa iPhone Aja"
            className="h-12 w-auto mb-2"
          />
          <span className="font-bold text-xl text-gray-900">
            sewaiphoneaja.bekasi
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Email"
            type="text"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="Masukkan email"
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            placeholder="Masukkan password"
            error={errors.password}
            showPasswordToggle
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} sewaiphoneaja.bekasi
        </p>
      </div>
    </div>
  );
}
