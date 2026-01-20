const jwt = require("jsonwebtoken");
const { resError } = require("../helpers/sendResponse");

const verifyToken = (req, res, next) => {
  // 1. Coba ambil dari header
  let authHeader = req.headers["authorization"];
  let token = null;

  if (authHeader) {
    token = authHeader.split(" ")[1];
  }

  // 2. Kalau ga ada header, coba ambil dari query string ?token=xxx
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token)
    return resError(res, "Token tidak ditemukan", "Unauthorized", 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded;
    next();
  } catch (err) {
    return resError(res, "Token tidak valid atau expired", err.message, 401);
  }
};

module.exports = { verifyToken };
