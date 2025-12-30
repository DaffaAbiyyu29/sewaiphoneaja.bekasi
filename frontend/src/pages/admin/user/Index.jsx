import Datatable from "../../../components/Datatable";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { UserColumns } from "../../../columns/User";
import { useNavigate } from "react-router-dom";

export default function UserPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    navigate("/menu/user/create");
  };

  const handleStatusChange = async (userId, newStatus) => {
    const newStatusText = newStatus ? "Active" : "Inactive";
    const confirmResult = await Swal.fire({
      title: "Ubah status user?",
      text: `Status akan diubah menjadi ${newStatusText}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Ya, ubah",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    Swal.fire({
      title: "Mengubah status...",
      text: "Mohon tunggu sebentar",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/user/status/${userId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Status user berhasil diubah.",
        showConfirmButton: false,
        timer: 2000,
      });

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text:
          err.response?.data?.message ||
          "Terjadi kesalahan saat mengubah status user.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDelete = async (userId) => {
    const confirmResult = await Swal.fire({
      title: "Apakah kamu yakin?",
      text: "Data user ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    Swal.fire({
      title: "Menghapus user...",
      text: "Mohon tunggu sebentar",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "User berhasil dihapus.",
        showConfirmButton: false,
        timer: 2000,
      });

      // 🔁 Refresh tabel data
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus!",
        text:
          err.response?.data?.message ||
          "Terjadi kesalahan saat menghapus user.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="p-6">
      <Datatable
        key={refreshKey}
        apiUrl={`${API_URL}/api/user`}
        columns={UserColumns(handleDelete)}
        allowAdd={true}
        onAddClick={handleAddClick}
      />
    </div>
  );
}
