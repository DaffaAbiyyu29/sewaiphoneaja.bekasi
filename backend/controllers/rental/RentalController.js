const { Op, col, where, cast } = require("sequelize");
const TrnRent = require("../../models/TrnRental");
const sequelize = require("../../models/index");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const MstCustomer = require("../../models/MstCustomer");
const Sequelize = require("sequelize");
const {
  generateIncrementId,
  generateInvoiceNumber,
  lastInvoiceNumber,
} = require("../../helpers/generateID");
const TrnDetailRent = require("../../models/TrnDetailRental");
const MstUnit = require("../../models/MstUnit");
const MstVariantUnit = require("../../models/MstVariantUnit");
const TrnPayment = require("../../models/TrnPayment");
const MstPriceUnit = require("../../models/MstPriceUnit");
const MstUser = require("../../models/MstUser");

const isCustomerActive = (customer) => {
  if (!customer) return false;

  // Sesuaikan dengan tipe field status di DB kamu:
  // - Bisa string: "Active"/"Inactive"
  // - Bisa int: 1/0
  // - Bisa boolean: true/false

  const s = String(customer.status || "")
    .trim()
    .toLowerCase();

  // semua variasi "active" dianggap aktif
  if (s === "active") return true;

  // semua variasi "Inactive" dianggap tidak aktif
  if (s === "inactive") return false;

  // kalau ada nilai lain (mis "blocked") => anggap tidak aktif

  return false;
};

const createRent = async (req, res) => {
  try {
    const {
      customer_id: bodyCustomerId,
      nik, // ✅ tambah ini
      start_rent_date,
      end_rent_date,
      duration,
      collect_date,
      return_date,
      total_price,
      total_paid,
      balance,
      created_by,
    } = req.body;

    // ✅ resolve customer_id: prioritas customer_id, kalau tidak ada cari dari NIK
    let customer_id = bodyCustomerId;

    if (!customer_id && nik) {
      const c = await MstCustomer.findOne({
        where: { nik: String(nik).trim() },
        attributes: ["customer_id", "nik", "status"],
      });

      if (!c) {
        return resError(
          res,
          "Customer tidak ditemukan",
          "NIK tidak terdaftar",
          404,
        );
      }

      customer_id = c.customer_id;
    }

    // validasi required
    const missing = [];
    if (!customer_id) missing.push("customer_id (atau kirim nik)");
    if (total_price === undefined || total_price === null || total_price === "")
      missing.push("total_price");

    if (missing.length) {
      return resError(
        res,
        "Data rental tidak lengkap",
        `Missing fields: ${missing.join(", ")}`,
        400,
      );
    }

    // --- VALIDASI CUSTOMER ACTIVE ---
    const customer = await MstCustomer.findOne({
      where: { customer_id },
      attributes: ["customer_id", "fullname", "nik", "status"],
    });

    if (!customer) {
      return resError(res, "Customer tidak ditemukan", "Not Found", 404);
    }

    if (!isCustomerActive(customer)) {
      return resError(
        res,
        "Customer tidak bisa menyewa",
        `Customer (${customer.nik || "-"}) berstatus INACTIVE`,
        403,
      );
    }

    // ✅ opsional: cegah sewa baru kalau masih ada rental belum close
    const ongoingRent = await TrnRent.findOne({
      where: {
        customer_id,
        status: { [Op.notIn]: ["Close", "Cancelled"] },
        return_date: null,
      },
      order: [["created_at", "DESC"]],
    });

    if (ongoingRent) {
      return resError(
        res,
        "Customer masih memiliki rental aktif",
        "Masih ada peminjaman yang belum ditutup",
        409,
      );
    }
    // --- END VALIDASI CUSTOMER ACTIVE ---

    // generate rent_id dan invoice_number
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
          duration: duration || null,
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
          status: "Waiting Payment",
          invoice_number: invoiceNo,
          created_at: new Date(),
          created_by: created_by || null,
        },
        { transaction: t },
      );

      // No separate approval history table anymore. Notes and status
      // will be stored directly on the `trn_rent` record.

      await t.commit();

      return resSuccess(res, "Rental berhasil dibuat", newRent, null, 201);
    } catch (txErr) {
      await t.rollback();
      console.error(
        "Transaction failed creating rent and approval history:",
        txErr,
      );
      return resError(
        res,
        "Gagal membuat rental (transaction) : " + txErr.message,
        txErr.message,
        500,
      );
    }
  } catch (err) {
    return resError(
      res,
      "Gagal membuat rental : " + err.message,
      err.message,
      500,
    );
  }
};

const restoreStockForRent = async (rentOrId, t) => {
  const rent_id = typeof rentOrId === "string" ? rentOrId : rentOrId?.rent_id;
  if (!rent_id) throw new Error("rent_id is required for restoreStockForRent");

  let localT = t;
  let createdTx = false;
  if (!localT) {
    localT = await sequelize.transaction();
    createdTx = true;
  }

  // lock rent
  const rent = await TrnRent.findOne({
    where: { rent_id },
    transaction: localT,
    lock: Sequelize.Transaction.LOCK.UPDATE,
  });

  if (!rent) {
    if (createdTx) await localT.rollback();
    throw new Error("Rent not found");
  }

  // already restored? stop.
  if (Number(rent.is_stock_restored) === 1) {
    if (createdTx) await localT.commit();
    return;
  }

  const details = await TrnDetailRent.findAll({
    where: { rent_id },
    transaction: localT,
    lock: Sequelize.Transaction.LOCK.UPDATE,
  });

  if (!details.length) {
    // tandai restored supaya tidak diulang
    await rent.update(
      { is_stock_restored: 1, updated_at: new Date() },
      { transaction: localT },
    );
    return;
  }

  // Instead of modifying physical `qty`, recalculate availability per variant
  // for the rent's date range and set variant/unit `status` accordingly.
  const unitCodes = [...new Set(details.map((d) => d.unit_code).filter(Boolean))];

  for (const d of details) {
    if (!d.variant_unit_code) continue;

    const variant = await MstVariantUnit.findOne({
      where: { variant_unit_code: d.variant_unit_code },
      transaction: localT,
      lock: Sequelize.Transaction.LOCK.UPDATE,
    });

    if (!variant) continue;

    const physicalQty = Number(variant.qty || 0);

    const bookedQty = await getBookedQtyVariantInRange({
      variant_unit_code: d.variant_unit_code,
      startDate: rent.start_rent_date,
      endDate: rent.end_rent_date,
      t: localT,
    });

    const availableQty = Math.max(physicalQty - bookedQty, 0);

    await MstVariantUnit.update(
      {
        status: availableQty > 0 ? "Available" : "Unavailable",
        updated_at: new Date(),
      },
      { where: { variant_unit_code: d.variant_unit_code }, transaction: localT },
    );
  }

  // Update unit status based on variants' current availability
  for (const unit_code of unitCodes) {
    const variants = await MstVariantUnit.findAll({
      where: { unit_code, is_delete: 0 },
      attributes: ["qty", "variant_unit_code"],
      transaction: localT,
      lock: Sequelize.Transaction.LOCK.UPDATE,
    });

    let anyAvailable = false;

    for (const v of variants) {
      const physicalQty = Number(v.qty || 0);
      const bookedQty = await getBookedQtyVariantInRange({
        variant_unit_code: v.variant_unit_code,
        startDate: rent.start_rent_date,
        endDate: rent.end_rent_date,
        t: localT,
      });
      if (physicalQty - bookedQty > 0) {
        anyAvailable = true;
        break;
      }
    }

    await MstUnit.update(
      {
        status: anyAvailable ? "Available" : "Unavailable",
        updated_at: new Date(),
      },
      { where: { unit_code }, transaction: localT },
    );
  }

  // Mark rent as restored to avoid repeated work
  await rent.update({ is_stock_restored: 1, updated_at: new Date() }, { transaction: localT });

  if (createdTx) await localT.commit();
};

const cancelRent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { rentId } = req.params;
    const { notes } = req.body;

    if (!req.user) {
      await t.rollback();
      return resError(
        res,
        "Akses ditolak",
        "Token tidak valid / belum login",
        401,
      );
    }

    const rent = await TrnRent.findOne({
      where: { rent_id: rentId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!rent) {
      await t.rollback();
      return resError(res, "Rental tidak ditemukan", "Not Found", 404);
    }

    if (rent.status === "Close") {
      await t.rollback();
      return resError(res, "Rental sudah ditutup", "Conflict", 409);
    }

    if (rent.status === "Cancelled") {
      await t.commit();
      return resSuccess(res, "Rental sudah dibatalkan sebelumnya", rent);
    }

    if (rent.status === "Open" || rent.collect_date) {
      await t.rollback();
      return resError(
        res,
        "Tidak bisa cancel, unit sudah diambil",
        "Conflict",
        409,
      );
    }

    // ✅ cukup ubah status -> otomatis tanggal jadi available lagi
    await rent.update(
      {
        status: "Cancelled",
        notes: notes ?? rent.notes,
        updated_at: new Date(),
        updated_by: req.user.user_id || req.user.email || "ADMIN",
      },
      { transaction: t },
    );

    // commit first so other transactions see the cancelled status
    await t.commit();

    // then recalculate availability in a separate transaction so updates
    // are visible immediately to other requests (frontend/customer view).
    try {
      await restoreStockForRent(rent.rent_id);
    } catch (e) {
      console.error("Failed to restore availability statuses after commit:", e.message || e);
    }

    return resSuccess(
      res,
      `Rental dibatalkan. Tanggal ${rent.start_rent_date} s/d ${rent.end_rent_date} otomatis kembali tersedia.`,
      rent,
    );
  } catch (err) {
    await t.rollback();
    return resError(res, "Gagal cancel rental", err.message, 500);
  }
};

//buat Rental aktif berdasarkan tanggal
// GET /api/rent/active-by-customer/:customerId?date=2026-01-10
const getActiveRentByCustomerAndDate = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { date } = req.query;

    if (!customerId) {
      return resError(res, "customerId wajib", "Bad Request", 400);
    }

    if (!date) {
      return resError(res, "query date wajib (YYYY-MM-DD)", "Bad Request", 400);
    }

    const targetDate = new Date(date);

    const rent = await TrnRent.findOne({
      where: {
        customer_id: customerId,
        status: { [Op.notIn]: ["Close", "Cancelled"] },
        start_rent_date: { [Op.lte]: targetDate },
        end_rent_date: { [Op.gte]: targetDate },
      },
      order: [["created_at", "DESC"]],
    });

    return resSuccess(res, "Cek rental customer berhasil", {
      has_active_rent: !!rent,
      rent: rent || null,
    });
  } catch (err) {
    return resError(res, "Gagal cek rental customer", err.message, 500);
  }
};

//List rental yang overlap di rentang tanggal
// GET /api/rent?start=2026-01-09&end=2026-01-10&customer_id=CUST0001
const getRentsByDateRange = async (req, res) => {
  try {
    const { start, end, customer_id } = req.query;

    if (!start || !end) {
      return resError(
        res,
        "start dan end wajib (YYYY-MM-DD)",
        "Bad Request",
        400,
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // overlap rule:
    // rentalStart <= endDate AND rentalEnd >= startDate
    const whereClause = {
      status: { [Op.notIn]: ["Close", "Cancelled"] },
      start_rent_date: { [Op.lte]: endDate },
      end_rent_date: { [Op.gte]: startDate },
      ...(customer_id ? { customer_id } : {}),
    };

    const rows = await TrnRent.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
    });

    return resSuccess(
      res,
      "Rental berdasarkan rentang tanggal berhasil diambil",
      rows,
    );
  } catch (err) {
    return resError(res, "Gagal mengambil rental", err.message, 500);
  }
};

//buat ambil unit oleh customer
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
    if (["Close", "Cancelled"].includes(rent.status)) {
      await t.rollback();
      return resError(
        res,
        "Unit tidak bisa diambil (Status: " + rent.status + ")",
        "Conflict",
        409,
      );
    }

    await rent.update(
      {
        collect_date: collect_date || new Date(), // Gunakan collect_date, bukan return_date
        status: "Open", // Pastikan status menjadi Open (sedang disewa)
        notes: notes || rent.notes,
        updated_at: new Date(),
        updated_by: updated_by || rent.updated_by,
      },
      { transaction: t },
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
    const { return_date, notes } = req.body;

    if (!rentId) {
      await t.rollback();
      return resError(res, "rentId diperlukan", "Bad Request", 400);
    }

    const rent = await TrnRent.findOne({
      where: { rent_id: rentId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!rent) {
      await t.rollback();
      return resError(res, "Rental tidak ditemukan", "Not Found", 404);
    }

    if (rent.status === "Cancelled") {
      await t.rollback();
      return resError(res, "Rental sudah dibatalkan", "Conflict", 409);
    }

    if (rent.status === "Close") {
      await t.commit();
      return resSuccess(res, "Rental sudah ditutup sebelumnya", rent);
    }

    // // await restoreStockForRent(rentId, t);
    // await restoreStockForRent(rentId, t);

    // ✅ CLOSE RENTAL
    await rent.update(
      {
        return_date: return_date || new Date(),
        status: "Close",
        notes: notes ?? rent.notes,
        updated_at: new Date(),
        updated_by:
          req.user?.user_id || req.user?.email || rent.updated_by || null,
      },
      { transaction: t },
    );

    await t.commit();

    return resSuccess(
      res,
      `Unit dikembalikan. Stok tersedia kembali mulai tanggal return: ${rent.return_date}`,
      rent,
    );
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

    // Build WHERE clause untuk search dan filter
    let whereClause = {};

    // Search functionality
    if (search && search.trim() !== "") {
      whereClause[Op.or] = [
        // Nama Customer
        where(col("customer.fullname"), {
          [Op.like]: `%${search}%`,
        }),

        // Invoice
        { invoice_number: { [Op.like]: `%${search}%` } },

        // Status
        // { status: { [Op.like]: `%${search}%` } },

        // Total Harga
        where(cast(col("total_price"), "CHAR"), {
          [Op.like]: `%${search}%`,
        }),

        // Total Bayar
        where(cast(col("total_paid"), "CHAR"), {
          [Op.like]: `%${search}%`,
        }),

        // Sisa Bayar
        where(cast(col("balance"), "CHAR"), {
          [Op.like]: `%${search}%`,
        }),
      ];
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
      where: { rent_id: rentId, is_delete: 0 },
      order: [["created_at", "ASC"]],
    });

    const userIds = [
      ...new Set(
        payments
          .flatMap((p) => [p.created_by, p.updated_by])
          .filter((x) => x != null),
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
      500,
    );
  }
};

const getNextInvoice = async (req, res) => {
  try {
    const invoice = await lastInvoiceNumber("trn_rent");

    res.json({
      invoice,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal generate invoice",
      err,
    });
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
          attributes: ["customer_id", "fullname", "nik", "telp", "email"],
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
      500,
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
      status,
      updated_by,
      notes,
    } = req.body;

    const rent = await TrnRent.findOne({ where: { rent_id: rentId } });
    if (!rent) return resError(res, "Rental tidak ditemukan", "Not Found", 404);

    // 2️⃣ VALIDASI: jika customer_id DIUBAH, pastikan customer AKTIF
    if (customer_id && customer_id !== rent.customer_id) {
      const customer = await MstCustomer.findOne({
        where: { customer_id },
        attributes: ["customer_id", "nik", "status"],
      });

      if (!customer) {
        return resError(res, "Customer tidak ditemukan", "Not Found", 404);
      }

      if (!isCustomerActive(customer)) {
        return resError(
          res,
          "Customer tidak bisa menyewa",
          `Customer (${customer.nik || "-"}) berstatus INACTIVE`,
          403,
        );
      }
    }

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

const getBookedQtyVariantInRange = async ({
  variant_unit_code,
  startDate,
  endDate,
  t,
}) => {
  const rows = await TrnDetailRent.findAll({
    attributes: [
      "variant_unit_code",
      [Sequelize.fn("SUM", Sequelize.col("trn_detail_rent.qty")), "booked_qty"],
    ],
    where: { variant_unit_code },
    include: [
      {
        model: TrnRent,
        as: "rent",
        attributes: [],
        required: true,
        where: {
          status: { [Op.notIn]: ["Close", "Cancelled"] }, // ✅ aktif saja
          start_rent_date: { [Op.lte]: endDate },
          end_rent_date: { [Op.gte]: startDate },
        },
      },
    ],
    group: ["variant_unit_code"],
    raw: true,
    transaction: t,
  });

  return rows?.[0]?.booked_qty ? Number(rows[0].booked_qty) : 0;
};

const createRentWithDetail = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      customer_id: bodyCustomerId,
      nik,
      start_rent_date,
      end_rent_date,
      duration,
      total_price,
      total_paid,
      created_by,
      notes,
      details = [],
    } = req.body;

    // =====================
    // VALIDASI BASIC
    // =====================
    if (!Array.isArray(details) || details.length === 0) {
      await t.rollback();
      return resError(
        res,
        "Detail rental wajib diisi",
        "details tidak boleh kosong",
        400,
      );
    }

    // =====================
    // RESOLVE CUSTOMER
    // =====================
    let customer_id = bodyCustomerId;

    if (!customer_id && nik) {
      const c = await MstCustomer.findOne({
        where: { nik: String(nik).trim() },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!c) {
        await t.rollback();
        return resError(
          res,
          "Customer tidak ditemukan",
          "NIK tidak terdaftar",
          404,
        );
      }

      customer_id = c.customer_id;
    }

    if (!customer_id) {
      await t.rollback();
      return resError(
        res,
        "customer_id atau nik wajib",
        "Missing customer identifier",
        400,
      );
    }

    const customer = await MstCustomer.findOne({
      where: { customer_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!customer) {
      await t.rollback();
      return resError(res, "Customer tidak ditemukan", "Not Found", 404);
    }

    if (!isCustomerActive(customer)) {
      await t.rollback();
      return resError(
        res,
        "Customer tidak bisa menyewa",
        `Status customer ${customer.status}`,
        403,
      );
    }

    // =====================
    // CEK RENTAL AKTIF
    // =====================
    const ongoingRent = await TrnRent.findOne({
      where: {
        customer_id,
        status: { [Op.notIn]: ["Close", "Cancelled"] },
        return_date: null,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (ongoingRent) {
      await t.rollback();
      return resError(
        res,
        "Customer masih punya rental aktif",
        "Masih ada rental belum ditutup",
        409,
      );
    }

    // =====================
    // CREATE RENT
    // =====================
    const rent_id = await generateIncrementId(TrnRent, "rent_id", "RENT");
    const invoiceNo = await generateInvoiceNumber("trn_rent");

    const rent = await TrnRent.create(
      {
        rent_id,
        customer_id,
        start_rent_date: start_rent_date || new Date(),
        end_rent_date: end_rent_date || null,
        duration: duration || null,
        total_price: Number(total_price),
        total_paid: Number(total_paid || 0),
        balance: Number(total_price) - Number(total_paid || 0),
        status: "Waiting Payment",
        invoice_number: invoiceNo,
        notes: notes ?? "",
        created_by: created_by || null,
        created_at: new Date(),
      },
      { transaction: t },
    );

    // =====================
    // LOOP DETAIL + POTONG STOK
    // =====================
    const createdDetails = [];

    for (const item of details) {
      const { unit_code, variant_unit_code, price, qty = 1 } = item;

      if (!unit_code || !variant_unit_code || !price) {
        await t.rollback();
        return resError(
          res,
          "Detail rental tidak valid",
          "unit_code, variant_unit_code, price wajib",
          400,
        );
      }

      const q = Number(qty);
      const p = Number(price);

      if (q <= 0 || p <= 0) {
        await t.rollback();
        return resError(res, "qty/price tidak valid", "Harus > 0", 400);
      }

      // ✅ ambil stok fisik (TIDAK DIKURANGI)
      const variant = await MstVariantUnit.findOne({
        where: { variant_unit_code },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!variant) {
        await t.rollback();
        return resError(res, "Variant tidak ditemukan", "Not Found", 404);
      }

      // ✅ hitung availability per tanggal (real-time)
      const physicalQty = Number(variant.qty || 0);

      const bookedQty = await getBookedQtyVariantInRange({
        variant_unit_code,
        startDate: new Date(start_rent_date),
        endDate: new Date(end_rent_date),
        t,
      });

      const availableQty = Math.max(physicalQty - bookedQty, 0);

      if (availableQty < q) {
        await t.rollback();
        return resError(
          res,
          "Stok tidak tersedia di tanggal tersebut",
          `Stok tersedia ${availableQty}, diminta ${q} (tanggal ${start_rent_date} s/d ${end_rent_date})`,
          409,
        );
      }

      // ✅ create detail (tanpa ubah stok fisik)
      const detail_id = await generateIncrementId(
        TrnDetailRent,
        "detail_id",
        "DET",
      );

      const detail = await TrnDetailRent.create(
        {
          detail_id,
          rent_id,
          unit_code,
          variant_unit_code,
          price: p,
          qty: q,
          subtotal: p * q,
          created_at: new Date(),
          created_by: created_by || null,
        },
        { transaction: t },
      );

      createdDetails.push(detail);
    }

    await t.commit();

    return resSuccess(
      res,
      "Rental berhasil dibuat",
      {
        rent,
        details: createdDetails,
      },
      null,
      201,
    );
  } catch (err) {
    await t.rollback();
    console.error(err);
    return resError(res, "Gagal membuat rental", err.message, 500);
  }
};

module.exports = {
  createRent,
  createRentWithDetail,
  getRents,
  getRentById,
  getRentByInvoiceOrNik,
  getActiveRentByCustomerAndDate,
  getRentsByDateRange,
  getNextInvoice,
  updateRent,
  deleteRent,
  cancelRent,
  restoreStockForRent,
  collectUnit,
  returnUnit,
};
