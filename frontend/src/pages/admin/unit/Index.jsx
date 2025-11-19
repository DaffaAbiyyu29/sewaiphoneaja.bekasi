import { UnitColumns } from "../../../columns/Unit";
import Datatable from "../../../components/Datatable";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function UnitPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    navigate("/menu/unit/create");
  };

  const handleDelete = async (unitCode) => {
    const confirmResult = await Swal.fire({
      title: "Apakah kamu yakin?",
      text: "Data unit ini akan dihapus secara permanen!",
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
      title: "Menghapus unit...",
      text: "Mohon tunggu sebentar",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/unit/${unitCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Unit berhasil dihapus.",
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
          "Terjadi kesalahan saat menghapus unit.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="p-6">
      <Datatable
        key={refreshKey}
        apiUrl={`${API_URL}/api/unit`}
        columns={UnitColumns(handleDelete)} // kirim fungsi delete ke kolom
        allowAdd={true}
        onAddClick={handleAddClick}
      />
    </div>
  );
}
