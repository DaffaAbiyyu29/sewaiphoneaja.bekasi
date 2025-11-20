# 🚀 SOLUSI TESTING CUSTOMER API DI POSTMAN

## ⚠️ MASALAH YANG DIALAMI
User mendapatkan HTML response (Vite page) ketika test di Postman, padahal seharusnya JSON.

**Penyebab:** 
- Mengakses URL yang salah (port frontend 5173 bukan 3000 backend)
- Atau backend belum berjalan

---

## ✅ SOLUSI

### Step 1: Pastikan Backend Berjalan
```bash
cd C:\xampp\htdocs\sewaiphoneaja.bekasi\backend
node index.js
```

Expected output:
```
Server jalan di http://localhost:3000
MySQL connected
```

### Step 2: Pastikan URL di Postman BENAR ❌➜✅

**SALAH:**
```
http://localhost:5173/api/customer    ❌ (Frontend Vite dev server)
```

**BENAR:**
```
http://localhost:3000/api/customer    ✅ (Backend API server)
```

---

## 🧪 TESTING ENDPOINT DI POSTMAN

### Penting: Auth Temporary Disabled untuk POST Create
Untuk testing mudah, endpoint `POST /api/customer` **tidak memerlukan token**.
Endpoint lain (GET, PUT, DELETE) tetap memerlukan `Authorization: Bearer <token>`

---

## 📝 TESTING SEQUENCE

### 1️⃣ CREATE CUSTOMER (Tanpa Auth - Public)

**Method:** POST
**URL:** `http://localhost:3000/api/customer`
**Headers:**
- Content-Type: application/json

**Body (raw JSON):**
```json
{
  "fullname": "John Doe",
  "nik": "1234567890123456",
  "telp": "081234567890",
  "email": "john@example.com",
  "address": "Jl. Example No. 123",
  "closest_contact_name": "Jane Doe",
  "closest_contact_telp": "081234567891",
  "social_media_type": "Instagram",
  "social_media_username": "johndoe_ig",
  "ktp_image": "ktp_john.jpg"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Customer berhasil dibuat",
  "data": {
    "customer_id": "CST0001",
    "fullname": "John Doe",
    "nik": "1234567890123456",
    "telp": "081234567890",
    "email": "john@example.com",
    "address": "Jl. Example No. 123",
    "closest_contact_name": "Jane Doe",
    "closest_contact_telp": "081234567891",
    "social_media_type": "Instagram",
    "social_media_username": "johndoe_ig",
    "ktp_image": "ktp_john.jpg",
    "created_at": "2025-11-19T12:30:00.000Z",
    "updated_at": "2025-11-19T12:30:00.000Z"
  }
}
```

✅ Jika berhasil, catat `customer_id` untuk test UPDATE & DELETE

---

### 2️⃣ CREATE CUSTOMER 2 (untuk testing list)

Buat customer kedua dengan data berbeda:
```json
{
  "fullname": "Jane Smith",
  "nik": "9876543210987654",
  "telp": "082345678901",
  "email": "jane@example.com",
  "address": "Jl. Smith St. 456",
  "closest_contact_name": "John Smith",
  "closest_contact_telp": "082345678902",
  "social_media_type": "TikTok",
  "social_media_username": "janesmith_tiktok",
  "ktp_image": "ktp_jane.jpg"
}
```

---

### 3️⃣ SETUP AUTH UNTUK OPERASI LAIN (GET, PUT, DELETE)

Karena GET/PUT/DELETE butuh token, dan saat ini tidak ada user di database, saya akan buat solusi temporary:

**Option A: Disable Auth untuk semua (Development Only)**
Edit `backend/routes/customer/CustomerRoute.js` - hapus `verifyToken` dari semua route

**Option B: Buat User Dummy di Database**
```sql
INSERT INTO mst_user (nik, name, email, password, status, created_at) 
VALUES ('9999999999999999', 'Admin Test', 'admin@test.com', 'hashed_password', 'Active', NOW());
```

**Rekomendasi: Gunakan Option A untuk testing**

---

### 4️⃣ TEST GET ALL CUSTOMERS

**Setelah edit route untuk public:**

**Method:** GET
**URL:** `http://localhost:3000/api/customer?page=1&limit=10`
**Headers:** (tidak perlu auth untuk now)

**Expected Response:**
```json
{
  "success": true,
  "message": "Daftar customer berhasil diambil",
  "data": [
    {
      "customer_id": "CST0001",
      "fullname": "John Doe",
      ...
    },
    {
      "customer_id": "CST0002",
      "fullname": "Jane Smith",
      ...
    }
  ],
  "totalData": 2,
  "currentPage": 1,
  "totalPages": 1,
  "pageSize": 10
}
```

---

### 5️⃣ TEST GET CUSTOMER BY ID

**Method:** GET
**URL:** `http://localhost:3000/api/customer/CST0001`

**Expected Response:**
```json
{
  "success": true,
  "message": "Detail customer berhasil diambil",
  "data": {
    "customer_id": "CST0001",
    "fullname": "John Doe",
    ...
  }
}
```

---

### 6️⃣ TEST UPDATE CUSTOMER

**Method:** PUT
**URL:** `http://localhost:3000/api/customer/CST0001`
**Headers:**
- Content-Type: application/json

**Body (update beberapa field):**
```json
{
  "fullname": "John Doe Updated",
  "telp": "089876543210",
  "address": "Jl. New Address No. 999"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Customer berhasil diperbarui",
  "data": {
    "customer_id": "CST0001",
    "fullname": "John Doe Updated",
    "telp": "089876543210",
    "address": "Jl. New Address No. 999",
    ...
  }
}
```

---

### 7️⃣ TEST DELETE CUSTOMER

**Method:** DELETE
**URL:** `http://localhost:3000/api/customer/CST0002`

**Expected Response:**
```json
{
  "success": true,
  "message": "Customer berhasil dihapus"
}
```

✅ Sekarang customer CST0002 sudah terhapus dari database

---

### 8️⃣ VERIFY DELETE (GET List lagi)

GET `http://localhost:3000/api/customer`

Seharusnya hanya ada 1 customer (CST0001) yang tersisa.

---

## 🔍 ERROR HANDLING TEST

### ❌ Error: Email Sudah Terdaftar
Coba buat customer dengan email yang sudah ada:
```json
{
  "fullname": "Duplicate Email",
  "email": "john@example.com",
  ...
}
```

**Expected Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Email sudah terdaftar",
  "error": "Conflict",
  "data": null
}
```

---

### ❌ Error: NIK Sudah Terdaftar
Coba buat customer dengan NIK yang sudah ada:
```json
{
  "fullname": "Duplicate NIK",
  "nik": "1234567890123456",
  ...
}
```

**Expected Response (409 Conflict):**
```json
{
  "success": false,
  "message": "NIK sudah terdaftar",
  "error": "Conflict",
  "data": null
}
```

---

### ❌ Error: Field Required Kosong
Coba POST tanpa field required:
```json
{
  "fullname": "Test",
  "email": "test@example.com"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Field berikut wajib diisi: nik, telp, address, closest_contact_name, ...",
  "error": "Validation Error",
  "data": null
}
```

---

### ❌ Error: Customer Tidak Ditemukan
GET `http://localhost:3000/api/customer/CST9999` (yang tidak ada)

**Expected Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Customer tidak ditemukan",
  "error": "Not Found",
  "data": null
}
```

---

## 📋 POSTMAN COLLECTION QUICK SETUP

1. **Create Folder:** "Customer API"
2. **Add Requests:**
   - POST /api/customer (CREATE)
   - GET /api/customer (LIST)
   - GET /api/customer/:id (GET BY ID)
   - PUT /api/customer/:id (UPDATE)
   - DELETE /api/customer/:id (DELETE)

3. **Set Environment Variable:**
   - `base_url = http://localhost:3000`
   - `customer_id = CST0001` (diupdate setelah create)

4. **Use in Requests:**
   - URL: `{{base_url}}/api/customer/{{customer_id}}`

---

## ✅ CHECKLIST TESTING

- [ ] Backend berjalan di port 3000
- [ ] POST Create Customer berhasil (201 Created)
- [ ] GET List all customers berhasil
- [ ] GET Detail customer by ID berhasil
- [ ] PUT Update customer berhasil
- [ ] DELETE customer berhasil
- [ ] Error validation (required fields) berhasil
- [ ] Error duplicate email/NIK berhasil
- [ ] Error not found berhasil

---

## 🎯 SOLUSI PERMANENT (Setelah Development)

Setelah semua testing selesai dan production-ready:

1. **Re-enable Auth untuk semua endpoint (kecuali create jika ingin public registration)**
2. **Setup proper user management di database**
3. **Implement role-based access control (RBAC)**
4. **Add password hashing untuk credentials**

---

**Sekarang ready untuk test di Postman! 🚀**
