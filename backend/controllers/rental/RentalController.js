const { Op } = require("sequelize");
const TrnRent = require("../../models/TrnRental");
const sequelize = require("../../models/index");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const MstCustomer = require("../../models/MstCustomer");
const {
  generateIncrementId,
  generateInvoiceNumber,
} = require("../../helpers/generateID");
const TrnDetailRent = require("../../models/TrnDetailRental");
const MstUnit = require("../../models/MstUnit");
const MstVariantUnit = require("../../models/MstVariantUnit");
const TrnPayment = require("../../models/TrnPayment");
const MstPriceUnit = require("../../models/MstPriceUnit");
const MstUser = require("../../models/MstUser");

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
    if (total_price === undefined || total_price === null || total_price === "")
      missing.push("total_price");
    if (missing.length)
      return resError(
        res,
        "Data rental tidak lengkap",
        `Missing fields: ${missing.join(", ")}`,
        400
      );

    const rent_id = await generateIncrementId(TrnRent, "rent_id", "RENT");
    const invoiceNo = await generateInvoiceNumber("trn_rent");

    // Use transaction so rental and approval history are created atomically
    const t = await sequelize.transaction();
    try {
      const newRent = await TrnRent.create(
        {
          rent_id,
          customer_id,
          start_rent_date: start_rent_date || new Date(),
          end_rent_date: end_rent_date || null,
          collect_date: collect_date || null,
          return_date: return_date || null,
          total_price: Number(total_price),
          total_paid:
            total_paid !== undefined && total_paid !== null && total_paid !== ""
              ? Number(total_paid)
              : 0,
          balance:
            balance !== undefined && balance !== null && balance !== ""
              ? Number(balance)
              : Number(total_price) - (total_paid || 0),
          is_approval: is_approval !== undefined ? Number(is_approval) : 0,
          approval_by: approval_by || null,
          approval_date: approval_date || null,
          status: status || "Waiting Approval",
          invoice_number: invoiceNo,
          created_at: new Date(),
          created_by: created_by || null,
        },
        { transaction: t }
      );

      // No separate approval history table anymore. Notes and status
      // will be stored directly on the `trn_rent` record.

      await t.commit();

      return resSuccess(res, "Rental berhasil dibuat", newRent, null, 201);
    } catch (txErr) {
      await t.rollback();
      console.error(
        "Transaction failed creating rent and approval history:",
        txErr
      );
      return resError(
        res,
        "Gagal membuat rental (transaction)",
        txErr.message,
        500
      );
    }
  } catch (err) {
    return resError(res, "Gagal membuat rental", err.message, 500);
  }
};

const approveRent = async (req, res) => {
  try {
    const { rentId } = req.params;
    const { approval_by, notes, updated_by } = req.body;

    const rent = await TrnRent.findOne({ where: { rent_id: rentId } });
    if (!rent) return resError(res, "Rental tidak ditemukan", "Not Found", 404);

    await rent.update({
      status: "Waiting Payment",
      approval_by: approval_by || updated_by || rent.approval_by,
      approval_date: new Date(),
      updated_at: new Date(),
      updated_by: updated_by || rent.updated_by,
    });

    // We store notes (if any) directly on the rental record.
    try {
      await rent.update({ notes: notes || rent.notes });
    } catch (noteErr) {
      console.error("Failed to save notes on approve:", noteErr);
    }

    return resSuccess(res, "Rental berhasil di-approve", rent);
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal approve rental", err.message, 500);
  }
};

const rejectRent = async (req, res) => {
  try {
    const { rentId } = req.params;
    const { approval_by, notes, updated_by } = req.body;

    const rent = await TrnRent.findOne({ where: { rent_id: rentId } });
    if (!rent) return resError(res, "Rental tidak ditemukan", "Not Found", 404);

    await rent.update({
      status: "Rejected Approval",
      approval_by: approval_by || updated_by || rent.approval_by,
      approval_date: new Date(),
      updated_at: new Date(),
      updated_by: updated_by || rent.updated_by,
    });

    // Save rejection notes directly on the rental record.
    try {
      await rent.update({ notes: notes || rent.notes });
    } catch (noteErr) {
      console.error("Failed to save notes on reject:", noteErr);
    }

    return resSuccess(res, "Rental berhasil ditolak", rent);
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal menolak rental", err.message, 500);
  }
};

const collectUnit = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { rentId } = req.params;
    const { collect_date, notes, updated_by } = req.body;

    if (!rentId) {
      await t.rollback();
      return resError(res, "rentId diperlukan", "Bad Request", 400);
    }

    const rent = await TrnRent.findOne({
      where: { rent_id: rentId },
      transaction: t,
    });

    if (!rent) {
      await t.rollback();
      return resError(res, "Rental tidak ditemukan", "Not Found", 404);
    }

    // VALIDASI: Hanya bisa collect jika statusnya 'Open' atau setelah 'Waiting Payment'
    // Tergantung flow Anda, biasanya unit diambil saat status sudah bukan 'Waiting Approval'
    if (rent.status === "Close" || rent.status === "Rejected Approval") {
      await t.rollback();
      return resError(res, "Unit tidak bisa diambil (Status: " + rent.status + ")", "Conflict", 409);
    }

    await rent.update(
      {
        collect_date: collect_date || new Date(), // Gunakan collect_date, bukan return_date
        status: "Open", // Pastikan status menjadi Open (sedang disewa)
        notes: notes || rent.notes,
        updated_at: new Date(),
        updated_by: updated_by || rent.updated_by,
      },
      { transaction: t }
    );

    await t.commit();
    return resSuccess(res, "Unit berhasil diambil oleh pelanggan", rent);
  } catch (err) {
    await t.rollback();
    console.error(err);
    return resError(res, "Gagal proses collect unit", err.message, 500);
  }
};

// ini untuk RETURN UNIT / CLOSE RENTAL ke customer
const returnUnit = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { rentId } = req.params;
    const { return_date, notes, updated_by } = req.body;

    if (!rentId) {
      await t.rollback();
      return resError(res, "rentId diperlukan", "Bad Request", 400);
    }

    const rent = await TrnRent.findOne({
      where: { rent_id: rentId },
      transaction: t,
    });

    if (!rent) {
      await t.rollback();
      return resError(res, "Rental tidak ditemukan", "Not Found", 404);
    }

    if (rent.status === "Close") {
      await t.rollback();
      return resError(
        res,
        "Rental sudah ditutup / unit sudah dikembalikan",
        "Conflict",
        409
      );
    }

    await rent.update(
      {
        return_date: return_date || new Date(),
        status: "Close",
        notes: notes || rent.notes,
        updated_at: new Date(),
        updated_by: updated_by || rent.updated_by,
      },
      { transaction: t }
    );

    await t.commit();
    return resSuccess(res, "Unit berhasil dikembalikan / rental ditutup", rent);
  } catch (err) {
    await t.rollback();
    console.error(err);
    return resError(res, "Gagal return unit", err.message, 500);
  }
};

const getRents = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      orderBy = "created_at",
      orderDir = "DESC",
      customer_id = "",
      status = "",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Validasi limit
    const allowedLimits = [10, 25, 50, 100];
    if (!allowedLimits.includes(limit)) limit = 10;

    const offset = (page - 1) * limit;

    // Field yang bisa dicari
    const searchableFields = [
      "rent_id",
      "customer_id",
      "approval_by",
      "invoice_number",
    ];

    // Build WHERE clause untuk search dan filter
    let whereClause = {};

    // Search functionality
    if (search && search.trim() !== "") {
      whereClause = {
        [Op.or]: searchableFields.map((field) => ({
          [field]: { [Op.like]: `%${search}%` },
        })),
      };
    }

    // Filter by customer_id (jika ada)
    if (customer_id && customer_id.trim() !== "") {
      whereClause.customer_id = customer_id;
    }

    // Filter by status (jika ada)
    if (status && status.trim() !== "") {
      whereClause.status = status;
    }

    // Validasi orderBy - field yang tersedia di MstRental
    const validOrderBy = [
      "rent_id",
      "invoice_number",
      "customer_id",
      "start_rent_date",
      "end_rent_date",
      "collect_date",
      "return_date",
      "total_price",
      "total_paid",
      "balance",
      "status",
      "created_at",
      "updated_at",
    ];
    if (!validOrderBy.includes(orderBy)) orderBy = "created_at";

    // Validasi orderDir
    const validOrderDir = ["ASC", "DESC"];
    if (!validOrderDir.includes(orderDir)) orderDir = "DESC";

    // Include customer fullname if available
    // define association locally so include works even if Relations.js doesn't declare it
    if (!TrnRent.associations.customer) {
      TrnRent.belongsTo(MstCustomer, {
        foreignKey: "customer_id",
        as: "customer",
      });
    }

    // Query dengan pagination
    const { count, rows } = await TrnRent.findAndCountAll({
      where: whereClause,
      order: [[orderBy, orderDir]],
      limit,
      offset,
      include: [
        {
          model: MstCustomer,
          as: "customer",
          attributes: ["customer_id", "fullname"],
          required: false,
        },
      ],
    });

    const formatted = rows.map((item) => {
      const json = item.toJSON();

      const customerName = json.customer?.fullname || null;
      delete json.customer; // hapus biar ga muncul lagi

      return {
        ...json,
        customer_name: customerName,
      };
    });

    const totalPages = Math.ceil(count / limit);

    return resSuccess(res, "Daftar rental berhasil diambil", formatted, {
      totalData: count,
      currentPage: page,
      totalPages,
      pageSize: limit,
    });
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal mengambil daftar rental", err.message, 500);
  }
};

const getRentById = async (req, res) => {
  try {
    const { rentId } = req.params;

    // Ambil data rent
    const rent = await TrnRent.findOne({ where: { rent_id: rentId } });
    if (!rent) return resError(res, "Rental tidak ditemukan", "Not Found", 404);

    // Ambil detail rental + relasi
    const details = await TrnDetailRent.findAll({
      where: { rent_id: rentId },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: MstUnit,
          as: "unit",
          attributes: ["unit_code", "unit_name"],
          required: false,
        },
        {
          model: MstVariantUnit,
          as: "variant",
          attributes: ["variant_unit_code", "color", "photo"],
          required: false,
        },
      ],
    });

    const payments = await TrnPayment.findAll({
      where: { rent_id: rentId },
      order: [["created_at", "ASC"]],
    });

    const userIds = [
      ...new Set(
        payments
          .flatMap((p) => [p.created_by, p.updated_by])
          .filter((x) => x != null)
      ),
    ];

    // Query user
    const users = await MstUser.findAll({
      where: { user_id: userIds },
      attributes: ["user_id", "name"],
    });

    const userMap = {};
    users.forEach((u) => {
      userMap[u.user_id] = u.name;
    });

    const formattedPayments = payments.map((p) => {
      const json = p.toJSON();
      return {
        ...json,
        created_by: json.created_by ? userMap[json.created_by] || null : null,
        updated_by: json.updated_by ? userMap[json.updated_by] || null : null,
      };
    });

    // Format detail
    const formattedDetails = details.map((item) => {
      const json = item.toJSON();

      const unit_name = json.unit?.unit_name || null;
      const variant_name = json.variant?.color || null;
      const variant_photo = json.variant?.photo || null;

      delete json.unit;
      delete json.variant;

      return {
        ...json,
        unit_name,
        variant_name,
        variant_photo,
      };
    });

    // Gabung rent + detail
    const responseData = {
      ...rent.toJSON(),
      details: formattedDetails,
      payments: formattedPayments,
    };

    return resSuccess(res, "Data rental berhasil diambil", responseData);
  } catch (err) {
    return resError(
      res,
      "Gagal mengambil data rental beserta detailnya",
      err.message,
      500
    );
  }
};

const getRentByInvoiceOrNik = async (req, res) => {
  try {
    let { search } = req.params;

    // Kalau search kosong
    if (!search || search.trim() === "") {
      return resSuccess(res, "Parameter pencarian wajib diisi", {});
    }

    // CARI BERDASARKAN INVOICE NUMBER
    let rent = await TrnRent.findOne({
      where: {
        invoice_number: search,
        status: { [Op.ne]: "Close" },
      },
      include: [
        {
          model: MstCustomer,
          as: "customer",
          attributes: ["customer_id", "fullname", "nik"],
        },
      ],
    });

    // JIKA TIDAK KETEMU, CARI BERDASARKAN NIK CUSTOMER
    if (!rent) {
      rent = await TrnRent.findOne({
        where: {
          status: { [Op.ne]: "Close" },
        },
        include: [
          {
            model: MstCustomer,
            as: "customer",
            attributes: ["customer_id", "fullname", "nik", "telp", "email"],
            where: { nik: search },
          },
        ],
      });
    }

    // KALO TETEP NGGAK KETEMU → success = true tapi data = {}
    if (!rent) {
      return resSuccess(res, "Data rental tidak ditemukan", {});
    }

    // GET RENT DETAIL + INCLUDE FULL UNIT (variants + prices)
    const details = await TrnDetailRent.findAll({
      where: { rent_id: rent.rent_id },
      include: [
        {
          model: MstUnit,
          as: "unit",
          include: [
            {
              model: MstVariantUnit,
              as: "variants",
              attributes: [
                "variant_unit_code",
                "color",
                "qty",
                "status",
                "photo",
              ],
              required: false,

              // FILTER VARIANT BERDASARKAN VARIANT DARI DETAIL
              where: {
                variant_unit_code: {
                  [Op.eq]: sequelize.col("trn_detail_rent.variant_unit_code"),
                },
              },
            },
            {
              model: MstPriceUnit,
              as: "prices",
              attributes: ["price_id", "duration", "price_per_day", "status"],
            },
          ],
        },
      ],
    });

    // GET PAYMENTS
    const payments = await TrnPayment.findAll({
      where: { rent_id: rent.rent_id },
      order: [["created_at", "ASC"]],
    });

    // FORMAT DETAIL → unit FULL MODEL
    const formattedDetails = details.map((item) => {
      const j = item.toJSON();
      return {
        detail_id: j.detail_id,
        rent_id: j.rent_id,
        qty: j.qty,
        price: j.price,
        subtotal: j.subtotal,

        // FULL UNIT
        unit: j.unit
          ? {
              unit_code: j.unit.unit_code,
              unit_name: j.unit.unit_name,
              brand: j.unit.brand,
              description: j.unit.description,
              status: j.unit.status,
              photo: j.unit.photo,
              created_at: j.unit.created_at,
              created_by: j.unit.created_by,
              updated_at: j.unit.updated_at,
              updated_by: j.unit.updated_by,

              // variants: j.unit.variants || [],
              variant: j.unit.variants?.[0] || null,
              prices: j.unit.prices || [],
            }
          : null,
      };
    });

    // RETURN SUCCESS
    return resSuccess(res, "Data rental berhasil diambil", {
      ...rent.toJSON(),
      details: formattedDetails,
      payments,
    });
  } catch (err) {
    return resError(
      res,
      "Gagal mengambil data rental beserta detailnya",
      err.message,
      500
    );
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
      notes,
    } = req.body;

    const rent = await TrnRent.findOne({ where: { rent_id: rentId } });
    if (!rent) return resError(res, "Rental tidak ditemukan", "Not Found", 404);

    await rent.update({
      customer_id: customer_id ?? rent.customer_id,
      start_rent_date: start_rent_date ?? rent.start_rent_date,
      end_rent_date: end_rent_date ?? rent.end_rent_date,
      collect_date: collect_date ?? rent.collect_date,
      return_date: return_date ?? rent.return_date,
      total_price:
        total_price !== undefined && total_price !== null && total_price !== ""
          ? Number(total_price)
          : rent.total_price,
      total_paid:
        total_paid !== undefined && total_paid !== null && total_paid !== ""
          ? Number(total_paid)
          : rent.total_paid,
      balance:
        balance !== undefined && balance !== null && balance !== ""
          ? Number(balance)
          : rent.balance,
      is_approval:
        is_approval !== undefined ? Number(is_approval) : rent.is_approval,
      approval_by: approval_by ?? rent.approval_by,
      approval_date: approval_date ?? rent.approval_date,
      status: status ?? rent.status,
      notes: notes ?? rent.notes,
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
    if (!deleted)
      return resError(res, "Rental tidak ditemukan", "Not Found", 404);
    return resSuccess(res, "Rental berhasil dihapus");
  } catch (err) {
    return resError(res, "Gagal menghapus rental", err.message, 500);
  }
};

module.exports = {
  createRent,
  getRents,
  getRentById,
  getRentByInvoiceOrNik,
  updateRent,
  deleteRent,
  approveRent,
  rejectRent,
  collectUnit,
  returnUnit,
};
