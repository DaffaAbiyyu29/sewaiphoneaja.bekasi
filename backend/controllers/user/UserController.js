const MstUser = require("../../models/MstUser");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const bcrypt = require("bcrypt");

const generateUserId = () => {
  return `USR${Date.now().toString().slice(-10)}`;
};

const createUser = async (req, res) => {
  try {
    let { user_id, nik, name, email, password, telp, address, gender, birth_place, birth_date, profile_picture, created_by } = req.body;

    const missing = [];
    if (!nik) missing.push('nik');
    if (!name) missing.push('name');
    if (!password) missing.push('password');
    if (missing.length) return resError(res, 'Data user tidak lengkap', `Missing fields: ${missing.join(', ')}`, 400);

    // generate user_id if not provided
    if (!user_id) user_id = generateUserId();

    // check existing nik or email
    const existNik = await MstUser.findOne({ where: { nik } });
    if (existNik) return resError(res, 'NIK sudah terdaftar', 'Conflict', 409);
    if (email) {
      const existEmail = await MstUser.findOne({ where: { email } });
      if (existEmail) return resError(res, 'Email sudah terdaftar', 'Conflict', 409);
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
      status: 'active',
      created_at: new Date(),
      created_by: created_by || null,
      updated_at: new Date(),
      updated_by: created_by || null,
    });

    // do not return password
    const userData = user.toJSON();
    delete userData.password;

    return resSuccess(res, 'User berhasil dibuat', userData, null, 201);
  } catch (err) {
    return resError(res, 'Gagal membuat user', err.message, 500);
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

    const users = await MstUser.findAll({ where, order: [['created_at', 'DESC']] });
    const data = users.map(u => { const x = u.toJSON(); delete x.password; return x; });
    return resSuccess(res, 'Daftar user berhasil diambil', data);
  } catch (err) {
    return resError(res, 'Gagal mengambil daftar user', err.message, 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await MstUser.findOne({ where: { user_id } });
    if (!user) return resError(res, 'User tidak ditemukan', 'Not Found', 404);
    const data = user.toJSON(); delete data.password;
    return resSuccess(res, 'Data user berhasil diambil', data);
  } catch (err) {
    return resError(res, 'Gagal mengambil user', err.message, 500);
  }
};

const updateUser = async (req, res) => {
  try {
    // accept user_id from URL param (user_id or userId) or from body
    const user_id = req.params.user_id || req.params.userId || req.body.user_id;
    if (!user_id) return resError(res, 'Parameter user_id diperlukan', 'Bad Request', 400);
    // debug log to help when testing
    console.log('updateUser params:', req.params, 'body keys:', Object.keys(req.body));
    const { nik, name, email, password, telp, address, gender, birth_place, birth_date, profile_picture, status, created_by, updated_by } = req.body;

    const user = await MstUser.findOne({ where: { user_id } });
    if (!user) return resError(res, 'User tidak ditemukan', 'Not Found', 404);

    const updateData = {
      nik: nik ?? user.nik,
      name: name ?? user.name,
      email: email ?? user.email,
      telp: telp ?? user.telp,
      address: address ?? user.address,
      gender: gender ?? user.gender,
      birth_place: birth_place ?? user.birth_place,
      birth_date: birth_date ?? user.birth_date,
      profile_picture: profile_picture ?? user.profile_picture,
      status: status ?? user.status,
      created_by: created_by || user.created_by,
      updated_at: new Date(),
      updated_by: updated_by || user.updated_by,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);
    const data = user.toJSON(); delete data.password;
    return resSuccess(res, 'User berhasil diperbarui', data);
  } catch (err) {
    return resError(res, 'Gagal memperbarui user', err.message, 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user_id = req.params.user_id || req.params.userId || req.body.user_id;
    if (!user_id) return resError(res, 'Parameter user_id diperlukan', 'Bad Request', 400);
    console.log('deleteUser params:', req.params);
    const deleted = await MstUser.destroy({ where: { user_id } });
    if (!deleted) return resError(res, 'User tidak ditemukan', 'Not Found', 404);
    return resSuccess(res, 'User berhasil dihapus');
  } catch (err) {
    return resError(res, 'Gagal menghapus user', err.message, 500);
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
