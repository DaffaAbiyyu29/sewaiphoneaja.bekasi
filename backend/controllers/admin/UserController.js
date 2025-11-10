const { resSuccess, resError } = require("../../helpers/sendResponse");
const MstUser = require("../../models/MstUser");

// GET all users
const getAll = async (req, res) => {
  try {
    const users = await MstUser.findAll({
      attributes: { exclude: ["password"] }, // jangan return password
    });

    return resSuccess(res, "Daftar user berhasil diambil", users);
  } catch (err) {
    return resError(res, "Gagal mengambil data user", err.message, 500);
  }
};

// GET user by NIK
const getByNik = async (req, res) => {
  try {
    const { nik } = req.params;
    const user = await MstUser.findOne({
      where: { nik },
      attributes: { exclude: ["password"] },
    });

    if (!user) return resError(res, "User tidak ditemukan", "Not Found", 404);

    return resSuccess(res, "User berhasil ditemukan", user);
  } catch (err) {
    return resError(res, "Gagal mengambil data user", err.message, 500);
  }
};

module.exports = { getAll, getByNik };
