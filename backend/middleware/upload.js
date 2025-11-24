// middleware/upload.js

const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan folder tempat file akan disimpan
    // Pastikan folder 'uploads/' sudah ada
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    // Menentukan nama file agar unik
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Mengambil ekstensi asli
    const ext = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  },
});

// Filter untuk hanya menerima gambar (opsional, tapi disarankan)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diizinkan!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batasan ukuran file (misalnya 5MB)
});

const deletePhoto = (filePathOrName) => {
  try {
    if (!filePathOrName) return;

    // 1) Jika diberikan full path dan file ada, hapus langsung
    if (fs.existsSync(filePathOrName)) {
      fs.unlinkSync(filePathOrName);
      console.log(`File berhasil dihapus: ${filePathOrName}`);
      return;
    }

    // 2) Jika diberikan hanya nama file, coba beberapa lokasi umum
    const tryPaths = [
      path.join(__dirname, "../public/images", filePathOrName),
      path.join(__dirname, "../public/uploads", filePathOrName),
    ];

    for (const p of tryPaths) {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log(`File berhasil dihapus: ${p}`);
        return;
      }
    }

    // Jika tidak ditemukan, log saja dan lanjutkan
    console.warn(`File tidak ditemukan untuk dihapus: ${filePathOrName}`);
  } catch (err) {
    console.error(`Gagal menghapus file ${filePathOrName}:`, err.message);
    // Tetap lanjutkan respons, karena error hapus file tidak boleh memblokir respons ke user
  }
};

module.exports = {
  uploadPhoto: upload.single("photo"),
  deletePhoto,
};
