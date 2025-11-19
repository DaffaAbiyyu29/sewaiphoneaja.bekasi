import jwtDecode from "jwt-decode";
import { getToken } from "./GetToken";

export const getUserInfo = () => {
  // 1. Ambil token dari penyimpanan (misalnya localStorage)
  const token = getToken();

  if (!token) {
    console.warn("Token tidak ditemukan di localStorage.");
    return null;
  }

  try {
    // 2. Decode token untuk mendapatkan payload (informasi pengguna)
    const decodedPayload = jwtDecode(token);

    // 3. (Opsional) Cek apakah token sudah expired
    const currentTime = Date.now() / 1000; // waktu saat ini dalam detik

    // 'exp' adalah properti standar di payload JWT untuk expiration time
    if (decodedPayload.exp && decodedPayload.exp < currentTime) {
      console.warn("Token sudah expired.");
      // Kamu mungkin ingin menambahkan logic untuk logout atau refresh token di sini
      return null;
    }

    // 4. Kembalikan informasi pengguna (payload)
    return decodedPayload;
  } catch (error) {
    // Tangani error jika format token tidak valid atau ada masalah saat decode
    console.error("Gagal melakukan decode JWT:", error);
    return null;
  }
};
