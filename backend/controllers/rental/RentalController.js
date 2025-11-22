const TrnRent = require("../../models/MstRental");
const { resSuccess, resError } = require("../../helpers/sendResponse");

const generateRentId = () => {
  return `RNT${Date.now().toString().slice(-10)}`;
};

const createRent = async (req, res) => {
  try {
    const {
      customer_id,
      start_rent_date,
      end_rent_date,
      collect_date,
      return_date,
      total_price,
      total_paid,
      balance,
      is_approval,
      approval_by,
      approval_date,
      status,
      created_by,
    } = req.body;

    const missing = [];
    if (!customer_id) missing.push("customer_id");
    if (total_price === undefined || total_price === null || total_price === "") missing.push("total_price");
    if (missing.length) return resError(res, "Data rental tidak lengkap", `Missing fields: ${missing.join(", ")}`, 400);

    const rent_id = generateRentId();

    const newRent = await TrnRent.create({
      rent_id,
      customer_id,
      start_rent_date: start_rent_date || new Date(),
      end_rent_date: end_rent_date || null,
      collect_date: collect_date || null,
      return_date: return_date || null,
      total_price: Number(total_price),
      total_paid: total_paid !== undefined && total_paid !== null && total_paid !== "" ? Number(total_paid) : 0,
      balance: balance !== undefined && balance !== null && balance !== "" ? Number(balance) : (Number(total_price) - (total_paid || 0)),
      is_approval: is_approval !== undefined ? Number(is_approval) : 0,
      approval_by: approval_by || null,
      approval_date: approval_date || null,
      status: status || "Open",
      created_at: new Date(),
      created_by: created_by || null,
      updated_at: new Date(),
      updated_by: created_by || null,
    });

    return resSuccess(res, "Rental berhasil dibuat", newRent, null, 201);
  } catch (err) {
    return resError(res, "Gagal membuat rental", err.message, 500);
  }
};

const getRents = async (req, res) => {
  try {
    const { customer_id, status } = req.query;
    const where = {};
    if (customer_id) where.customer_id = customer_id;
    if (status) where.status = status;

    const rents = await TrnRent.findAll({ where, order: [["created_at", "DESC"]] });
    return resSuccess(res, "Daftar rental berhasil diambil", rents);
  } catch (err) {
    return resError(res, "Gagal mengambil daftar rental", err.message, 500);
  }
};

const getRentById = async (req, res) => {
  try {
    const { rentId } = req.params;
    const rent = await TrnRent.findOne({ where: { rent_id: rentId } });
    if (!rent) return resError(res, "Rental tidak ditemukan", "Not Found", 404);
    return resSuccess(res, "Data rental berhasil diambil", rent);
  } catch (err) {
    return resError(res, "Gagal mengambil rental", err.message, 500);
  }
};

const updateRent = async (req, res) => {
  try {
    const { rentId } = req.params;
    const {
      customer_id,
      start_rent_date,
      end_rent_date,
      collect_date,
      return_date,
      total_price,
      total_paid,
      balance,
      is_approval,
      approval_by,
      approval_date,
      status,
      updated_by,
    } = req.body;

    const rent = await TrnRent.findOne({ where: { rent_id: rentId } });
    if (!rent) return resError(res, "Rental tidak ditemukan", "Not Found", 404);

    await rent.update({
      customer_id: customer_id ?? rent.customer_id,
      start_rent_date: start_rent_date ?? rent.start_rent_date,
      end_rent_date: end_rent_date ?? rent.end_rent_date,
      collect_date: collect_date ?? rent.collect_date,
      return_date: return_date ?? rent.return_date,
      total_price: total_price !== undefined && total_price !== null && total_price !== "" ? Number(total_price) : rent.total_price,
      total_paid: total_paid !== undefined && total_paid !== null && total_paid !== "" ? Number(total_paid) : rent.total_paid,
      balance: balance !== undefined && balance !== null && balance !== "" ? Number(balance) : rent.balance,
      is_approval: is_approval !== undefined ? Number(is_approval) : rent.is_approval,
      approval_by: approval_by ?? rent.approval_by,
      approval_date: approval_date ?? rent.approval_date,
      status: status ?? rent.status,
      updated_at: new Date(),
      updated_by: updated_by || rent.updated_by,
    });

    return resSuccess(res, "Rental berhasil diperbarui", rent);
  } catch (err) {
    return resError(res, "Gagal memperbarui rental", err.message, 500);
  }
};

const deleteRent = async (req, res) => {
  try {
    const { rentId } = req.params;
    const deleted = await TrnRent.destroy({ where: { rent_id: rentId } });
    if (!deleted) return resError(res, "Rental tidak ditemukan", "Not Found", 404);
    return resSuccess(res, "Rental berhasil dihapus");
  } catch (err) {
    return resError(res, "Gagal menghapus rental", err.message, 500);
  }
};

module.exports = {
  createRent,
  getRents,
  getRentById,
  updateRent,
  deleteRent,
};
