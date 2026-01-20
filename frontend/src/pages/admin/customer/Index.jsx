import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import { CustomerColumns } from "../../../columns/Customer";
import Datatable from "../../../components/shared/Datatable";

export default function CustomerPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStatusChange = async (customerId, newStatus) => {
    const newStatusText = newStatus ? "Active" : "Inactive";
    const confirmResult = await Swal.fire({
      title: "Ubah status customer?",
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
        `${API_URL}/api/customer/status/${customerId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Status customer berhasil diubah.",
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
          "Terjadi kesalahan saat mengubah status customer.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="p-6">
      <Datatable
        key={refreshKey}
        apiUrl={`${API_URL}/api/customer`}
        columns={CustomerColumns(handleStatusChange)}
        allowAdd={false}
      />
    </div>
  );
}
