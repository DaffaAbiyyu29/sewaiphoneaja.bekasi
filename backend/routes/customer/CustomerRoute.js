const express = require("express");
const { verifyToken } = require("../../middleware/middleware");
const {
  getAllCustomers,
  getCustomerByID,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomerByEmail,
} = require("../../controllers/customer/CustomerController");
const router = express.Router();

// =======================
// ✅ CUSTOMER CRUD ROUTES
// =======================
// 🚀 NOTE: Untuk development/testing, semua route TEMPORARY tanpa auth
// Di production, tambahkan verifyToken middleware ke setiap route yang butuh protection

// GET ALL CUSTOMERS (dengan pagination & search)
// GET /api/customer
// Query params: page, limit, search, orderBy, orderDir
router.get("/", getAllCustomers);

// GET CUSTOMER BY ID
// GET /api/customer/:customerId
router.get("/:customerId", getCustomerByID);

// SEARCH CUSTOMER BY EMAIL
// GET /api/customer/search?email=customer@example.com
router.get("/search", searchCustomerByEmail);

// CREATE NEW CUSTOMER (PUBLIC - untuk testing/registration)
// POST /api/customer
// Body: { fullname, nik, telp, email, address, closest_contact_name, closest_contact_telp, social_media_type, social_media_username, ktp_image }
router.post("/", createCustomer);

// UPDATE CUSTOMER
// PUT /api/customer/:customerId
router.put("/:customerId", updateCustomer);

// DELETE CUSTOMER
// DELETE /api/customer/:customerId
router.delete("/:customerId", deleteCustomer);

module.exports = router;
