const UpdatePriceHarga = async (priceCode, formData, onSuccess) => {
  Swal.fire({
    title: "Menyimpan perubahan...",
    text: "Mohon tunggu sebentar",
    didOpen: () => Swal.showLoading(),
    allowOutsideClick: false,
    allowEscapeKey: false,
  });

  try {
    const token = localStorage.getItem("token");

    const res = await axios.put(
      `${API_URL}/api/unit/price/${priceCode}`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Harga berhasil diperbarui.",
      showConfirmButton: false,
      timer: 2000,
    });

    if (onSuccess) onSuccess(res.data.data);
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Gagal Mengupdate!",
      text:
        err.response?.data?.message ||
        "Terjadi kesalahan saat memperbarui harga.",
      confirmButtonText: "OK",
    });
  }
};
