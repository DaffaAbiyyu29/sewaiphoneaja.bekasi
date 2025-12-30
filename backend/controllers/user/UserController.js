const MstUser = require("../../models/MstUser");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const bcrypt = require("bcrypt");
const { deletePhoto } = require("../../middleware/upload");

const { generateIncrementId } = require("../../helpers/generateID");

const createUser = async (req, res) => {
  try {
    let {
      nik,
      name,
      email,
      password,
      telp,
      address,
      gender,
      birth_place,
      birth_date,
      profile_picture,
      created_by,
    } = req.body;

    // If a file was uploaded by multer, use its filename as profile_picture
    if (req.file && req.file.filename) {
      profile_picture = req.file.filename;
    }

    const missing = [];
    if (!nik) missing.push("nik");
    if (!name) missing.push("name");
    if (!password) missing.push("password");
    if (missing.length)
      return resError(
        res,
        "Data user tidak lengkap",
        `Missing fields: ${missing.join(", ")}`,
        400
      );

    // generate user_id if not provided
    const user_id = await generateIncrementId(MstUser, "user_id", "USR");

    // check existing nik or email
    const existNik = await MstUser.findOne({ where: { nik } });
    if (existNik) return resError(res, "NIK sudah terdaftar", "Conflict", 409);
    if (email) {
      const existEmail = await MstUser.findOne({ where: { email } });
      if (existEmail)
        return resError(res, "Email sudah terdaftar", "Conflict", 409);
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await MstUser.create({
      user_id,
      nik,
      name,
      email: email || null,
      password: hashed,
      telp: telp || null,
      address: address || null,
      gender: gender || null,
      birth_place: birth_place || null,
      birth_date: birth_date || null,
      profile_picture: profile_picture || null,
      status: "Active",
      created_at: new Date(),
      created_by: created_by || null,
    });

    // do not return password
    const userData = user.toJSON();
    delete userData.password;

    return resSuccess(res, "User berhasil dibuat", userData, null, 201);
  } catch (err) {
    return resError(res, "Gagal membuat user", err.message, 500);
  }
};

const getUsers = async (req, res) => {
  try {
    const { user_id, nik, name, status } = req.query;
    const where = {};
    if (user_id) where.user_id = user_id;
    if (nik) where.nik = nik;
    if (name) where.name = name;
    if (status) where.status = status;

    const users = await MstUser.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    const data = users.map((u) => {
      const x = u.toJSON();
      delete x.password;
      return x;
    });
    return resSuccess(res, "Daftar user berhasil diambil", data);
  } catch (err) {
    return resError(res, "Gagal mengambil daftar user", err.message, 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const { nik } = req.params;

    const user = await MstUser.findOne({ where: { nik: nik } });
    if (!user) return resError(res, "User tidak ditemukan", "Not Found", 404);
    const data = user.toJSON();
    delete data.password;
    return resSuccess(res, "Data user berhasil diambil", data);
  } catch (err) {
    return resError(res, "Gagal mengambil user", err.message, 500);
  }
};

const updateUser = async (req, res) => {
  try {
    // 🔹 ambil nik dari URL param atau body
    const nik = req.params.nik || req.body.nik;
    if (!nik) {
      return resError(res, "Parameter nik diperlukan", "Bad Request", 400);
    }

    console.log("updateUser nik:", nik);
    console.log("body keys:", Object.keys(req.body));
    console.log("req.file:", req.file);

    const {
      name,
      email,
      password,
      telp,
      address,
      gender,
      birth_place,
      birth_date,
      status,
      updated_by,
    } = req.body;

    // 🔹 cari user berdasarkan NIK
    const user = await MstUser.findOne({ where: { nik } });
    if (!user) {
      return resError(res, "User tidak ditemukan", "Not Found", 404);
    }

    // 🔹 handle foto
    let newProfilePicture = user.profile_picture;
    if (req.file && req.file.filename) {
      if (user.profile_picture) {
        deletePhoto(user.profile_picture);
      }
      newProfilePicture = req.file.filename;
    }

    // 🔹 data update
    const updateData = {
      name: name ?? user.name,
      email: email ?? user.email,
      telp: telp ?? user.telp,
      address: address ?? user.address,
      gender: gender ?? user.gender,
      birth_place: birth_place ?? user.birth_place,
      birth_date: birth_date ?? user.birth_date,
      profile_picture: newProfilePicture,
      status: status ?? user.status,
      updated_at: new Date(),
      updated_by: updated_by || user.updated_by,
    };

    // 🔹 update password (kalau dikirim)
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    const data = user.toJSON();
    delete data.password;

    return resSuccess(res, "User berhasil diperbarui", data);
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal memperbarui user", err.message, 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    // 🔹 ambil nik dari param atau body
    const nik = req.params.nik || req.body.nik;
    if (!nik) {
      return resError(res, "Parameter nik diperlukan", "Bad Request", 400);
    }

    console.log("deleteUser nik:", nik);

    // 🔹 hapus user berdasarkan NIK
    const deleted = await MstUser.destroy({ where: { nik } });

    if (!deleted) {
      return resError(res, "User tidak ditemukan", "Not Found", 404);
    }

    return resSuccess(res, "User berhasil dihapus");
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal menghapus user", err.message, 500);
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
