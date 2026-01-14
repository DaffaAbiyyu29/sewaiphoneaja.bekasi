const TrnPayment = require("../../models/TrnPayment");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const { generateIncrementId } = require("../../helpers/generateID");
const TrnRent = require("../../models/TrnRental");
const { deletePhoto } = require("../../middleware/upload");

const createPayment = async (req, res) => {
  const photoPath = req.file ? req.file.path : null;
  const photoName = req.file ? req.file.filename : null;

  try {
    const { rent_id, due_date, total_payment, created_by } = req.body;

    const payment_id = await generateIncrementId(
      TrnPayment,
      "payment_id",
      "PAY"
    );

    // --- 2. Cek Duplikasi Unit Code ---
    const existing = await TrnPayment.findOne({ where: { payment_id } });
    if (existing) {
      deletePhoto(photoPath);
      return resError(res, "Kode pembayaran sudah terdaftar", "Conflict", 409);
    }

    const missing = [];
    if (!rent_id) missing.push("rent_id");
    if (
      total_payment === undefined ||
      total_payment === null ||
      total_payment === ""
    )
      missing.push("total_payment");
    if (missing.length) {
      return resError(
        res,
        "Data pembayaran tidak lengkap",
        `Missing fields: ${missing.join(", ")}`,
        400
      );
    }

    const newPayment = await TrnPayment.create({
      payment_id,
      rent_id,
      payment_date: new Date(),
      due_date: due_date || null,
      proof_of_payment: photoName,
      total_payment: Number(total_payment),
      status: "Unpaid",
      created_at: new Date(),
      created_by: created_by || null,
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
    where.is_delete = 0;

    const payments = await TrnPayment.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    return resSuccess(res, "Daftar pembayaran berhasil diambil", payments);
  } catch (err) {
    return resError(res, "Gagal mengambil daftar pembayaran", err.message, 500);
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await TrnPayment.findOne({
      where: { payment_id: paymentId, is_delete: 0 },
    });
    if (!payment)
      return resError(res, "Pembayaran tidak ditemukan", "Not Found", 404);
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
      total_payment,
      status,
      updated_by,
    } = req.body;

    const rent = await TrnRent.findOne({
      where: { rent_id: rent_id },
    });

    const payment = await TrnPayment.findOne({
      where: { payment_id: paymentId },
    });

    if (!payment)
      return resError(res, "Pembayaran tidak ditemukan", "Not Found", 404);

    await payment.update({
      rent_id: rent_id ?? payment.rent_id,
      payment_date: payment_date ?? payment.payment_date,
      due_date: due_date ?? payment.due_date,
      proof_of_payment: payment.proof_of_payment,
      total_payment:
        total_payment !== undefined &&
        total_payment !== null &&
        total_payment !== ""
          ? Number(total_payment)
          : payment.total_payment,
      status: status ?? payment.status,
      updated_at: new Date(),
      updated_by: updated_by || payment.updated_by,
    });

    // Kalau status payment = Paid, update total_paid & balance
    if (status === "Paid" && rent) {
      const newTotalPaid =
        Number(rent.total_paid) + Number(payment.total_payment);
      const newBalance = Number(rent.total_price) - newTotalPaid;

      await rent.update({
        total_paid: newTotalPaid,
        balance: newBalance,
      });

      if (status === "Paid" && rent) {
        const totalPaid = await TrnPayment.sum("total_payment", {
          where: { rent_id: rent.rent_id, status: "Paid" },
        });

        const newTotalPaid = Number(totalPaid || 0);
        const newBalance = Number(rent.total_price) - newTotalPaid;

        await rent.update({
          total_paid: newTotalPaid,
          balance: newBalance,
          status: newBalance <= 0 ? "Open" : "Waiting Payment",
        });
        // Jika balance <= 0 → ganti status rent jadi Open
        if (newBalance <= 0) {
          await rent.update({ status: "Open" });
        }
      }
    }

    return resSuccess(res, "Pembayaran berhasil diperbarui", payment);
  } catch (err) {
    return resError(res, "Gagal memperbarui pembayaran", err.message, 500);
  }
};

const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await TrnPayment.findOne({
      where: { payment_id: paymentId },
    });

    const rent = await TrnRent.findOne({
      where: { rent_id: payment.rent_id },
    });

    await rent.update({
      total_paid: Number(rent.total_paid) - Number(payment.total_payment),
      balance: Number(rent.balance) + Number(payment.total_payment),
      status:
        Number(rent.balance) + Number(payment.total_payment) <= 0
          ? "Open"
          : "Waiting Payment",
    });

    if (!payment)
      return resError(res, "Pembayaran tidak ditemukan", "Not Found", 404);

    await payment.update({
      is_delete: 1,
    });

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
