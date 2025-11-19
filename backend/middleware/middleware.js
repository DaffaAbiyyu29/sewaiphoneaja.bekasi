const jwt = require("jsonwebtoken");
const { resError } = require("../helpers/sendResponse");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return resError(res, "Token tidak ditemukan", "Unauthorized", 401);

  const token = authHeader.split(" ")[1];
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
