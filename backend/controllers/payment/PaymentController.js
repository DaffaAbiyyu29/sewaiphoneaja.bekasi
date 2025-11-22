const TrnPayment = require("../../models/MstPayment");
const { resSuccess, resError } = require("../../helpers/sendResponse");

// Simple payment id generator
const generatePaymentId = () => {
  return `PAY${Date.now().toString().slice(-10)}`;
};

const createPayment = async (req, res) => {
  try {
    const {
      rent_id,
      payment_date,
      due_date,
      proof_of_payment,
      total_payment,
      status,
      created_by,
    } = req.body;

    const missing = [];
    if (!rent_id) missing.push("rent_id");
    if (total_payment === undefined || total_payment === null || total_payment === "") missing.push("total_payment");
    if (missing.length) {
      return resError(res, "Data pembayaran tidak lengkap", `Missing fields: ${missing.join(", ")}`, 400);
    }

    const payment_id = generatePaymentId();

    const newPayment = await TrnPayment.create({
      payment_id,
      rent_id,
      payment_date: payment_date || new Date(),
      due_date: due_date || null,
      proof_of_payment: proof_of_payment || null,
      total_payment: Number(total_payment),
      status: status || "Unpaid",
      created_at: new Date(),
      created_by: created_by || null,
      updated_at: new Date(),
      updated_by: created_by || null,
    });

    return resSuccess(res, "Pembayaran berhasil dibuat", newPayment, null, 201);
  } catch (err) {
    return resError(res, "Gagal membuat pembayaran", err.message, 500);
  }
};

const getPayments = async (req, res) => {
  try {
    const { rent_id, status } = req.query;
    const where = {};
    if (rent_id) where.rent_id = rent_id;
    if (status) where.status = status;

    const payments = await TrnPayment.findAll({ where, order: [["created_at", "DESC"]] });
    return resSuccess(res, "Daftar pembayaran berhasil diambil", payments);
  } catch (err) {
    return resError(res, "Gagal mengambil daftar pembayaran", err.message, 500);
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await TrnPayment.findOne({ where: { payment_id: paymentId } });
    if (!payment) return resError(res, "Pembayaran tidak ditemukan", "Not Found", 404);
    return resSuccess(res, "Data pembayaran berhasil diambil", payment);
  } catch (err) {
    return resError(res, "Gagal mengambil pembayaran", err.message, 500);
  }
};

const updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const {
      rent_id,
      payment_date,
      due_date,
      proof_of_payment,
      total_payment,
      status,
      updated_by,
    } = req.body;

    const payment = await TrnPayment.findOne({ where: { payment_id: paymentId } });
    if (!payment) return resError(res, "Pembayaran tidak ditemukan", "Not Found", 404);

    await payment.update({
      rent_id: rent_id ?? payment.rent_id,
      payment_date: payment_date ?? payment.payment_date,
      due_date: due_date ?? payment.due_date,
      proof_of_payment: proof_of_payment ?? payment.proof_of_payment,
      total_payment: total_payment !== undefined && total_payment !== null && total_payment !== "" ? Number(total_payment) : payment.total_payment,
      status: status ?? payment.status,
      updated_at: new Date(),
      updated_by: updated_by || payment.updated_by,
    });

    return resSuccess(res, "Pembayaran berhasil diperbarui", payment);
  } catch (err) {
    return resError(res, "Gagal memperbarui pembayaran", err.message, 500);
  }
};

const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const deleted = await TrnPayment.destroy({ where: { payment_id: paymentId } });
    if (!deleted) return resError(res, "Pembayaran tidak ditemukan", "Not Found", 404);
    return resSuccess(res, "Pembayaran berhasil dihapus");
  } catch (err) {
    return resError(res, "Gagal menghapus pembayaran", err.message, 500);
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};
