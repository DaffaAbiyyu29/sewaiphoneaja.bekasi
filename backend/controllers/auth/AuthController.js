const MstUser = require("../../models/MstUser");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return resError(
        res,
        "Email dan password wajib diisi",
        "Validation Error",
        400
      );

    const user = await MstUser.findOne({ where: { email } });
    if (!user) return resError(res, "User tidak ditemukan", "Not Found", 404);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return resError(res, "Password salah", "Unauthorized", 401);

    // Generate JWT (include user_id)
    const payload = { user_id: user.user_id, name: user.name, nik: user.nik, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", {
      expiresIn: "2h",
    });

    const userData = {
      user_id: user.user_id,
      nik: user.nik,
      name: user.name,
      email: user.email,
      status: user.status,
      token, // tambahkan token di response
    };

    return resSuccess(res, "Login berhasil", userData);
  } catch (err) {
    return resError(res, "Terjadi kesalahan server", err.message, 500);
  }
};

module.exports = { login };
