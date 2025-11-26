import { CustomerColumns } from "../../../columns/Customer";
import Datatable from "../../../components/Datatable";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function CustomerPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (customerId) => {
    const confirmResult = await Swal.fire({
      title: "Apakah kamu yakin?",
      text: "Data customer ini akan dihapus secara permanen!",
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
      title: "Menghapus customer...",
      text: "Mohon tunggu sebentar",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Customer berhasil dihapus.",
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
          "Terjadi kesalahan saat menghapus customer.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="p-6">
      <Datatable
        key={refreshKey}
        apiUrl={`${API_URL}/api/customer`}
        columns={CustomerColumns(handleDelete)}
        allowAdd={false}
      />
    </div>
  );
}
