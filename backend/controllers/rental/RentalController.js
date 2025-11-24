const { Op } = require("sequelize");
const TrnRent = require("../../models/MstRental");
const { resSuccess, resError } = require("../../helpers/sendResponse");
<<<<<<< HEAD
const MstCustomer = require("../../models/MstCustomer");
=======
const { generateIncrementId } = require("../../helpers/generateID");
>>>>>>> 50d47c8f394dd62c8cd8e1604503911403de78ec


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

    const newRent = await TrnRent.create({
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
      status: status || "Open",
      created_at: new Date(),
      created_by: created_by || null,
    });

    return resSuccess(res, "Rental berhasil dibuat", newRent, null, 201);
  } catch (err) {
    return resError(res, "Gagal membuat rental", err.message, 500);
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
    const searchableFields = ["rent_id", "customer_id", "approval_by"];

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
  updateRent,
  deleteRent,
};
