const jwt = require("jsonwebtoken");
const { resError } = require("../helpers/sendResponse");

// Middleware untuk verify token
const verifyToken = (req, res, next) => {
  // Ambil token dari header Authorization
  const authHeader = req.headers["authorization"]; // format: "Bearer <token>"
  if (!authHeader)
    return resError(res, "Token tidak ditemukan", "Unauthorized", 401);

  const token = authHeader.split(" ")[1];
  if (!token)
    return resError(res, "Token tidak ditemukan", "Unauthorized", 401);

  try {
    // Verify token dengan secret yang sama seperti login
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    // Bisa simpan payload di req.user buat route lain
    req.user = decoded;
    next(); // lanjut ke route selanjutnya
  } catch (err) {
    return resError(res, "Token tidak valid atau expired", err.message, 401);
  }
};

module.exports = { verifyToken };
