const { Op } = require("sequelize");
const MstCustomer = require("../../models/MstCustomer");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const { generateCustomerID } = require("../../helpers/generateID");

// ===
// GET ALL CUSTOMERS
// ===
const getAllCustomers = async (req, res) => {
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

    // Validasi limit
    const allowedLimits = [10, 25, 50, 100];
    if (!allowedLimits.includes(limit)) limit = 10;

    const offset = (page - 1) * limit;

    // Field yang bisa dicari
    const searchableFields = [
      "customer_id",
      "fullname",
      "nik",
      "telp",
      "email",
    ];

    // Build WHERE clause untuk search
    let whereClause = {};
    if (search && search.trim() !== "") {
      whereClause = {
        [Op.or]: searchableFields.map((field) => ({
          [field]: { [Op.like]: `%${search}%` },
        })),
      };
    }

    // Validasi orderBy
    const validOrderBy = ["customer_id", "fullname", "email", "created_at"];
    if (!validOrderBy.includes(orderBy)) orderBy = "created_at";

    // Validasi orderDir
    const validOrderDir = ["ASC", "DESC"];
    if (!validOrderDir.includes(orderDir)) orderDir = "DESC";

    // Query dengan pagination
    const { count, rows } = await MstCustomer.findAndCountAll({
      where: whereClause,
      order: [[orderBy, orderDir]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return resSuccess(res, "Daftar customer berhasil diambil", rows, {
      totalData: count,
      currentPage: page,
      totalPages,
      pageSize: limit,
    });
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal mengambil data customer", err.message, 500);
  }
};

// ===
// GET CUSTOMER BY ID
// ===
const getCustomerByID = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return resError(res, "Customer ID diperlukan", "Bad Request", 400);
    }

    const customer = await MstCustomer.findOne({
      where: { customer_id: customerId },
    });

    if (!customer) {
      return resError(res, "Customer tidak ditemukan", "Not Found", 404);
    }

    return resSuccess(res, "Detail customer berhasil diambil", customer);
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal mengambil data customer", err.message, 500);
  }
};

// ===
// CREATE CUSTOMER
// ===
const createCustomer = async (req, res) => {
  try {
    const {
      fullname,
      nik,
      telp,
      email,
      address,
      closest_contact_name,
      closest_contact_telp,
      social_media_type,
      social_media_username,
      ktp_image,
    } = req.body;

    // Validasi field required
    const requiredFields = [
      "fullname",
      "nik",
      "telp",
      "email",
      "address",
      "closest_contact_name",
      "closest_contact_telp",
      "social_media_type",
      "social_media_username",
      "ktp_image",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return resError(
        res,
        `Field berikut wajib diisi: ${missingFields.join(", ")}`,
        "Validation Error",
        400
      );
    }

    // Generate customer ID
    const customer_id = await generateCustomerID();

    // Cek email sudah ada atau belum
    const existingEmail = await MstCustomer.findOne({ where: { email } });
    if (existingEmail) {
      return resError(res, "Email sudah terdaftar", "Conflict", 409);
    }

    // Cek NIK sudah ada atau belum
    const existingNIK = await MstCustomer.findOne({ where: { nik } });
    if (existingNIK) {
      return resError(res, "NIK sudah terdaftar", "Conflict", 409);
    }

    // Create customer
    const newCustomer = await MstCustomer.create({
      customer_id,
      fullname,
      nik,
      telp,
      email,
      address,
      closest_contact_name,
      closest_contact_telp,
      social_media_type,
      social_media_username,
      ktp_image,
    });

    return resSuccess(res, "Customer berhasil dibuat", newCustomer, null, 201);
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal membuat customer", err.message, 500);
  }
};

// ===
// UPDATE CUSTOMER
// ===
const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return resError(res, "Customer ID diperlukan", "Bad Request", 400);
    }

    const customer = await MstCustomer.findOne({
      where: { customer_id: customerId },
    });

    if (!customer) {
      return resError(res, "Customer tidak ditemukan", "Not Found", 404);
    }

    // Cek email unik (jika email diubah)
    if (req.body.email && req.body.email !== customer.email) {
      const existingEmail = await MstCustomer.findOne({
        where: { email: req.body.email },
      });
      if (existingEmail) {
        return resError(res, "Email sudah terdaftar", "Conflict", 409);
      }
    }

    // Cek NIK unik (jika NIK diubah)
    if (req.body.nik && req.body.nik !== customer.nik) {
      const existingNIK = await MstCustomer.findOne({
        where: { nik: req.body.nik },
      });
      if (existingNIK) {
        return resError(res, "NIK sudah terdaftar", "Conflict", 409);
      }
    }

    // Update customer
    await customer.update(req.body);

    return resSuccess(res, "Customer berhasil diperbarui", customer);
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal memperbarui customer", err.message, 500);
  }
};

// ===
// DELETE CUSTOMER
// ===
const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return resError(res, "Customer ID diperlukan", "Bad Request", 400);
    }

    const deleted = await MstCustomer.destroy({
      where: { customer_id: customerId },
    });

    if (!deleted) {
      return resError(res, "Customer tidak ditemukan", "Not Found", 404);
    }

    return resSuccess(res, "Customer berhasil dihapus");
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal menghapus customer", err.message, 500);
  }
};

// ===
// SEARCH CUSTOMER BY EMAIL
// ===
const searchCustomerByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return resError(res, "Email parameter diperlukan", "Bad Request", 400);
    }

    const customer = await MstCustomer.findOne({
      where: { email },
    });

    if (!customer) {
      return resError(
        res,
        "Customer dengan email tersebut tidak ditemukan",
        "Not Found",
        404
      );
    }

    return resSuccess(res, "Customer ditemukan", customer);
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal mencari customer", err.message, 500);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerByID,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomerByEmail,
};
