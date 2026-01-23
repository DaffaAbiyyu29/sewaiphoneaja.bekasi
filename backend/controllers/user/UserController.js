const MstUser = require("../../models/MstUser");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const bcrypt = require("bcrypt");
const { deletePhoto } = require("../../middleware/upload");

const { generateIncrementId } = require("../../helpers/generateID");
const { Op } = require("sequelize");

const clamp = (val, max, fallback = "") => {
  const s = String(val ?? "").trim();
  if (!s) return fallback;
  return s.length > max ? s.slice(0, max) : s;
};

const normalizeGender = (gender) => {
  const g = String(gender ?? "").trim();
  if (!g) return null;
  if (g === "M" || g === "F") return g;

  const low = g.toLowerCase();
  if (low.includes("laki") || low.includes("pria")) return "M";
  if (low.includes("perem") || low.includes("wanita")) return "F";
  return null;
};

const createUser = async (req, res) => {
  try {
    let {
      nik,
      name,
      role,
      email,
      password,
      telp,
      address,
      gender,
      birth_place,
      birth_date,
      created_by,
      updated_by,
    } = req.body;

    // ✅ upload: samakan dengan field yg route pakai
    // Kalau route multer pakai .single("photo") maka req.file ada.
    // Kalau route pakai .single("profile_picture") juga req.file ada.
    // Jadi cukup pakai req.file.filename apapun namanya.
    let profile_picture = null;
    if (req.file?.filename) profile_picture = req.file.filename;

    // ✅ Validasi sesuai DB (email NOT NULL, role NOT NULL, created_by & updated_by NOT NULL)
    const missing = [];
    if (!nik) missing.push("nik");
    if (!name) missing.push("name");
    if (!role) missing.push("role");
    if (!email) missing.push("email"); // DB: Null = No
    if (!password) missing.push("password");

    if (missing.length) {
      return resError(res, "Data user tidak lengkap", `Missing fields: ${missing.join(", ")}`, 400);
    }

    // ✅ nilai actor (untuk created_by & updated_by) max 16
    const actor = clamp(updated_by || created_by || "SYSTEM", 16, "SYSTEM");
    const actorCreated = clamp(created_by || updated_by || "SYSTEM", 16, "SYSTEM");

    // ✅ normalize enum gender
    const genderVal = normalizeGender(gender);

    // generate user_id
    const user_id = await generateIncrementId(MstUser, "user_id", "USR");

    // cek existing nik/email
    const existNik = await MstUser.findOne({ where: { nik } });
    if (existNik) return resError(res, "NIK sudah terdaftar", "Conflict", 409);

    const existEmail = await MstUser.findOne({ where: { email } });
    if (existEmail) return resError(res, "Email sudah terdaftar", "Conflict", 409);

    const hashed = await bcrypt.hash(password, 10);

    const user = await MstUser.create({
      user_id,
      nik: clamp(nik, 16),
      name: clamp(name, 100),
      role: clamp(role, 16),             // DB varchar(16) NOT NULL
      email: clamp(email, 100),          // DB NOT NULL
      password: hashed,
      telp: telp ? clamp(telp, 20) : null,
      address: address ? clamp(address, 255) : null,
      gender: genderVal,                 // enum('M','F') atau null
      birth_place: birth_place ? clamp(birth_place, 100) : null,
      birth_date: birth_date || null,
      profile_picture: profile_picture || null,
      status: "Active",
      is_delete: 0,
      created_at: new Date(),
      created_by: actorCreated,          // NOT NULL, max 16
      updated_by: actor,                 // NOT NULL, max 16
      updated_at: new Date(),
    });

    const userData = user.toJSON();
    delete userData.password;

    return resSuccess(res, "User berhasil dibuat", userData, null, 201);
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return resError(res, "Gagal membuat user", err?.original?.sqlMessage || err.message, 500);
  }
};


const getUsers = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      orderBy = "created_at",
      orderDir = "DESC",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const allowedLimits = [10, 25, 50, 100];
    if (!allowedLimits.includes(limit)) limit = 10;

    const offset = (page - 1) * limit;

    /** ================= SEARCH (GLOBAL) ================= */
    const searchableFields = [
      "user_id",
      "nik",
      "name",
      "email",
      "telp",
      "address",
      "gender",
      "status",
      "birth_place",
    ];

    const where = {
      is_delete: 0,
      ...(search.trim() !== ""
        ? {
            [Op.or]: searchableFields.map((field) => ({
              [field]: { [Op.like]: `%${search}%` },
            })),
          }
        : {}),
    };

    /** ================= ORDER ================= */
    const allowedOrderFields = [
      "user_id",
      "nik",
      "name",
      "role",
      "email",
      "telp",
      "address",
      "gender",
      "status",
      "birth_place",
      "birth_date",
      "created_at",
      "updated_at",
    ];

    const orderField = allowedOrderFields.includes(orderBy)
      ? orderBy
      : "created_at";

    const orderDirection = orderDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    /** ================= QUERY ================= */
    const { count, rows } = await MstUser.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderField, orderDirection]],
      attributes: { exclude: ["password"] },
    });

    return resSuccess(res, "Daftar user berhasil diambil", rows, {
      totalData: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      pageSize: limit,
      allowedPageSizes: allowedLimits,
    });
  } catch (err) {
    return resError(res, "Gagal mengambil daftar user", err.message, 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const { nik } = req.params;

    const user = await MstUser.findOne({ where: { nik: nik, is_delete: 0 } });
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

    const {
      name,
      role,
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
      role: role ?? user.role,
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

    // 1️⃣ cek user (yang belum dihapus)
    const user = await MstUser.findOne({
      where: {
        nik,
        is_delete: 0,
      },
    });

    if (!user) {
      return resError(res, "User tidak ditemukan", "Not Found", 404);
    }

    // 2️⃣ soft delete
    await MstUser.update({ is_delete: 1 }, { where: { nik } });

    // 3️⃣ response
    return resSuccess(res, "User berhasil dihapus (soft delete)");
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal menghapus user", err.message, 500);
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
