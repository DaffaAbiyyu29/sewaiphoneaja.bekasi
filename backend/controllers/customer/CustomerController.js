const { Op } = require("sequelize");
const MstCustomer = require("../../models/MstCustomer");
const TrnRent = require("../../models/TrnRental");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const { generateCustomerID } = require("../../helpers/generateID");
const { deletePhoto } = require("../../middleware/upload");

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
// GET CUSTOMER DETAIL (dengan URL KTP dan rental aktif)
// ===

const getCustomerDetail = async (req, res) => {
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

    // OPTIONAL: rental aktif customer (kalau mau ditampilkan di detail)
    const ongoingRent = await TrnRent.findOne({
      where: {
        customer_id: customer.customer_id,
        status: { [Op.notIn]: ["Close", "Cancelled"] },
        return_date: null,
      },
      order: [["created_at", "DESC"]],
    });

    // bikin URL image KTP supaya FE tinggal render
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const ktp_url = customer.ktp_image
      ? `${baseUrl}/uploads/${customer.ktp_image}` // sesuaikan folder static kamu
      : null;

    return resSuccess(res, "Detail customer berhasil diambil", {
      ...customer.toJSON(),
      ktp_url,
      ongoing_rent: ongoingRent || null,
    });
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal mengambil detail customer", err.message, 500);
  }
};
//
//END OF getCustomerDetail
//

// ===
// CHECK CUSTOMER BY NIK
// ===
const checkCustomerByNIK = async (req, res) => {
  try {
    const { nik } = req.params;

    if (!nik) {
      return resError(res, "Customer ID diperlukan", "Bad Request", 400);
    }

    const customer = await MstCustomer.findOne({ where: { nik } });

    // Jika customer tidak ditemukan => boleh lanjut (create customer dan sewa)
    if (!customer) {
      return resSuccess(res, "Customer tidak ditemukan, bisa lanjut", {
        customer: null,
        can_rent: true,
      });
    }

    // Jika customer ditemukan tetapi status bukan Active (mis. Inactive), blokir peminjaman
    const isCustomerActive = (customer) => {
      const s = String(customer.status || "")
        .trim()
        .toLowerCase();
      return s === "active";
    };
    if (!isCustomerActive(customer)) {
      return resError(
        res,
        "Customer tidak aktif sehingga tidak dapat melakukan peminjaman",
        "Conflict",
        409
      );
    }

    // Jika customer ditemukan, cek apakah ada rental aktif yang belum dikembalikan
    const ongoingRent = await TrnRent.findOne({
      where: {
        customer_id: customer.customer_id,
        status: { [Op.notIn]: ["Close", "Cancelled"] },
        return_date: null,
      },
      order: [["created_at", "DESC"]],
    });

    if (ongoingRent) {
      return resError(
        res,
        "Customer sedang melakukan peminjaman dan belum mengembalikan unit",
        "Conflict",
        409
      );
    }

    // Tidak ada rental aktif => customer boleh melakukan peminjaman
    return resSuccess(res, "Customer dapat melakukan peminjaman", {
      customer,
      can_rent: true,
    });
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal mengambil data customer", err.message, 500);
  }
};

// ===
// CREATE CUSTOMER
// ===
// helper normalize status
const isCustomerActive = (customer) => {
  const s = String(customer.status || "")
    .trim()
    .toLowerCase();
  return s === "active";
};

const createCustomer = async (req, res) => {
  const ktpPath = req.file ? req.file.path : null;
  const ktpName = req.file ? req.file.filename : null;

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
      status,
    } = req.body;

    // ✅ 1) CEK NIK sudah ada?
    if (nik) {
      const existing = await MstCustomer.findOne({ where: { nik } });

      if (existing) {
        // kalau ada file upload tapi customer sudah ada, jangan simpan file baru (biar ga numpuk)
        if (ktpPath) deletePhoto(ktpPath);

        // ✅ kalau customer INACTIVE, tetap block
        if (!isCustomerActive(existing)) {
          return resError(
            res,
            "Customer tidak aktif, tidak bisa digunakan untuk peminjaman",
            "Conflict",
            409
          );
        }

        // ✅ customer sudah ada dan ACTIVE → return sukses (tanpa insert)
        return resSuccess(
          res,
          "Customer sudah terdaftar (tidak dibuat ulang)",
          existing,
          null,
          200
        );
      }
    }

    // ✅ 2) kalau nik belum ada, boleh lanjut create (kode anda lanjut di bawah)
    // Validasi field required — ktp_image dapat berasal dari file upload
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
      "status",
    ];

    const missingFields = requiredFields.filter((field) => {
      if (field === "ktp_image") return !ktpName && !req.body[field];
      return !req.body[field];
    });

    if (missingFields.length > 0) {
      if (ktpPath) deletePhoto(ktpPath);
      return resError(
        res,
        `Field berikut wajib diisi: ${missingFields.join(", ")}`,
        "Validation Error",
        400
      );
    }

    // Generate customer ID
    const customer_id = await generateCustomerID();

    // ✅ OPTIONAL: Cek email sudah ada (agar tidak duplicate email juga)
    if (email) {
      const existingEmail = await MstCustomer.findOne({ where: { email } });
      if (existingEmail) {
        if (ktpPath) deletePhoto(ktpPath);
        return resError(res, "Email sudah terdaftar", "Conflict", 409);
      }
    }

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
      ktp_image: ktpName || req.body.ktp_image,
      status,
      created_by: "ADMIN",
    });

    return resSuccess(res, "Customer berhasil dibuat", newCustomer, null, 201);
  } catch (err) {
    if (ktpPath) deletePhoto(ktpPath);
    return resError(res, "Gagal membuat customer", err.message, 500);
  }
};

// ===
// UPDATE CUSTOMER
// ===
const updateCustomer = async (req, res) => {
  // Handle uploaded new KTP file (if any)
  const newKtpPath = req.file ? req.file.path : null;
  const newKtpName = req.file ? req.file.filename : null;

  try {
    const { customerId } = req.params;

    if (!customerId) {
      if (newKtpPath) deletePhoto(newKtpPath);
      return resError(res, "Customer ID diperlukan", "Bad Request", 400);
    }

    const customer = await MstCustomer.findOne({
      where: { customer_id: customerId },
    });

    if (!customer) {
      if (newKtpPath) deletePhoto(newKtpPath);
      return resError(res, "Customer tidak ditemukan", "Not Found", 404);
    }

    //jadi admin bisa blokir/inactive customer melalui update
    const allowedStatus = ["Active", "Inactive"];

    // support admin action via query (?action=block / inactive / activate)
    if (req.query.action) {
      const action = req.query.action.toLowerCase();

      if (action === "block") req.body.status = "Blocked";
      else if (action === "inactive") req.body.status = "Inactive";
      else if (action === "Active" || action === "unblock")
        req.body.status = "Active";
    }

    // if status is sent manually, validate it
    if (req.body.status && !allowedStatus.includes(req.body.status)) {
      if (newKtpPath) deletePhoto(newKtpPath);
      return resError(
        res,
        `Status tidak valid. Gunakan salah satu: ${allowedStatus.join(", ")}`,
        "Validation Error",
        400
      );
    }

    // Prepare update payload
    const oldKtpName = customer.ktp_image;

    const updateData = { ...req.body };

    // If new KTP uploaded, set filename; else if request asks to delete, set null
    if (newKtpName) {
      updateData.ktp_image = newKtpName;
    } else if (req.body.delete_image && req.body.delete_image === "true") {
      updateData.ktp_image = null;
    }

    // Update customer
    await customer.update(updateData);

    // If old ktp exists and was replaced or deleted, remove old file
    if (
      oldKtpName &&
      (newKtpName ||
        (req.body.delete_image && req.body.delete_image === "true"))
    ) {
      deletePhoto(oldKtpName);
    }

    return resSuccess(res, "Customer berhasil diperbarui", customer);
  } catch (err) {
    console.error(err);
    if (newKtpPath) deletePhoto(newKtpPath);
    return resError(res, "Gagal memperbarui customer", err.message, 500);
  }
};

const updateCustomerStatus = async (req, res) => {
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

    // ✅ NORMALISASI: apapun bentuknya (Active/active/Inactive/inactive)
    // kita buat pembandingnya jadi lowercase
    const current = String(customer.status || "")
      .trim()
      .toLowerCase();

    let newStatus;

    if (current === "active") {
      newStatus = "inactive";
    } else if (current === "inactive") {
      newStatus = "Active";
    } else {
      return resError(
        res,
        "Status customer tidak valid",
        `Validation Error (current status: ${customer.status})`,
        400
      );
    }

    await customer.update({ status: newStatus });

    return resSuccess(res, "Status customer berhasil diubah", {
      customer_id: customerId,
      status: newStatus,
    });
  } catch (err) {
    console.error(err);
    return resError(res, "Gagal update status customer", err.message, 500);
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

    // Ambil data customer dulu untuk mendapatkan nama file KTP (jika ada)
    const customer = await MstCustomer.findOne({
      where: { customer_id: customerId },
    });

    if (!customer) {
      return resError(res, "Customer tidak ditemukan", "Not Found", 404);
    }

    const oldKtpName = customer.ktp_image;

    const deleted = await MstCustomer.destroy({
      where: { customer_id: customerId },
    });

    if (!deleted) {
      return resError(res, "Gagal menghapus customer", "Server Error", 500);
    }

    // Hapus file KTP dari filesystem jika ada
    if (oldKtpName) deletePhoto(oldKtpName);

    return resSuccess(res, "Customer berhasil dihapus", {
      deleted_customer_id: customerId,
      deleted_ktp_image: oldKtpName || null,
    });
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
  getCustomerDetail,
  checkCustomerByNIK,
  updateCustomerStatus,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomerByEmail,
};
