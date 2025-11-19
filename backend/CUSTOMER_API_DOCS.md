# 📚 DOKUMENTASI API CUSTOMER - POSTMAN

## 🚀 Base URL
```
http://localhost:3000
```

## 🔐 Authentication
Semua endpoint memerlukan token JWT di header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 ENDPOINT LIST

### 1️⃣ GET ALL CUSTOMERS (dengan Pagination & Search)
**Endpoint:** `GET /api/customer`

**Query Parameters:**
- `page` (optional, default: 1) - Nomor halaman
- `limit` (optional, default: 10) - Jumlah data per halaman (10, 25, 50, 100)
- `search` (optional) - Cari berdasarkan: customer_id, fullname, nik, telp, email
- `orderBy` (optional, default: created_at) - Field untuk sorting: customer_id, fullname, email, created_at
- `orderDir` (optional, default: DESC) - Arah sorting: ASC atau DESC

**Example Request:**
```
GET /api/customer?page=1&limit=10&search=john&orderBy=fullname&orderDir=ASC
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Daftar customer berhasil diambil",
  "data": [
    {
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
      "created_at": "2025-11-19T10:30:00.000Z",
      "updated_at": "2025-11-19T10:30:00.000Z"
    }
  ],
  "totalData": 50,
  "currentPage": 1,
  "totalPages": 5,
  "pageSize": 10
}
```

---

### 2️⃣ GET CUSTOMER BY ID
**Endpoint:** `GET /api/customer/:customerId`

**URL Parameter:**
- `customerId` (required) - Customer ID (contoh: CST0001)

**Example Request:**
```
GET /api/customer/CST0001
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Detail customer berhasil diambil",
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
    "created_at": "2025-11-19T10:30:00.000Z",
    "updated_at": "2025-11-19T10:30:00.000Z"
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Customer tidak ditemukan",
  "error": "Not Found",
  "data": null
}
```

---

### 3️⃣ SEARCH CUSTOMER BY EMAIL
**Endpoint:** `GET /api/customer/search?email=john@example.com`

**Query Parameter:**
- `email` (required) - Email customer

**Example Request:**
```
GET /api/customer/search?email=john@example.com
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Customer ditemukan",
  "data": {
    "customer_id": "CST0001",
    "fullname": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

---

### 4️⃣ CREATE NEW CUSTOMER
**Endpoint:** `POST /api/customer`

**Request Body (JSON):**
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

**Response (Created - Status 201):**
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
    "created_at": "2025-11-19T10:30:00.000Z",
    "updated_at": "2025-11-19T10:30:00.000Z"
  }
}
```

**Response (Validation Error - Status 400):**
```json
{
  "success": false,
  "message": "Field berikut wajib diisi: fullname, email, ktp_image",
  "error": "Validation Error",
  "data": null
}
```

**Response (Email/NIK Sudah Terdaftar - Status 409):**
```json
{
  "success": false,
  "message": "Email sudah terdaftar",
  "error": "Conflict",
  "data": null
}
```

---

### 5️⃣ UPDATE CUSTOMER
**Endpoint:** `PUT /api/customer/:customerId`

**URL Parameter:**
- `customerId` (required) - Customer ID (contoh: CST0001)

**Request Body (JSON):** - Kirim field yang ingin diupdate
```json
{
  "fullname": "John Doe Updated",
  "telp": "081234567890",
  "email": "john.updated@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Customer berhasil diperbarui",
  "data": {
    "customer_id": "CST0001",
    "fullname": "John Doe Updated",
    "nik": "1234567890123456",
    "telp": "081234567890",
    "email": "john.updated@example.com",
    ...
  }
}
```

**Response (Customer Not Found - Status 404):**
```json
{
  "success": false,
  "message": "Customer tidak ditemukan",
  "error": "Not Found",
  "data": null
}
```

---

### 6️⃣ DELETE CUSTOMER
**Endpoint:** `DELETE /api/customer/:customerId`

**URL Parameter:**
- `customerId` (required) - Customer ID (contoh: CST0001)

**Example Request:**
```
DELETE /api/customer/CST0001
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Customer berhasil dihapus"
}
```

**Response (Customer Not Found - Status 404):**
```json
{
  "success": false,
  "message": "Customer tidak ditemukan",
  "error": "Not Found",
  "data": null
}
```

---

## 🧪 POSTMAN COLLECTION SETUP

### 1. Create Environment
1. Click **Environments** → **Create Environment**
2. Add variable:
   - Name: `base_url`
   - Initial Value: `http://localhost:3000`
   - Current Value: `http://localhost:3000`
3. Add variable:
   - Name: `token`
   - Initial Value: (kosongkan, akan diisi setelah login)
4. Save

### 2. Create Collection
1. Click **Collections** → **Create Collection** → name: "Customer API"

### 3. Add Requests ke Collection

#### Request 1: GET ALL CUSTOMERS
- Method: GET
- URL: `{{base_url}}/api/customer`
- Headers:
  - Authorization: `Bearer {{token}}`
- Params:
  - page: 1
  - limit: 10
  - search: (optional)
  - orderBy: created_at
  - orderDir: DESC

#### Request 2: GET CUSTOMER BY ID
- Method: GET
- URL: `{{base_url}}/api/customer/CST0001`
- Headers:
  - Authorization: `Bearer {{token}}`

#### Request 3: SEARCH BY EMAIL
- Method: GET
- URL: `{{base_url}}/api/customer/search`
- Headers:
  - Authorization: `Bearer {{token}}`
- Params:
  - email: john@example.com

#### Request 4: CREATE CUSTOMER
- Method: POST
- URL: `{{base_url}}/api/customer`
- Headers:
  - Authorization: `Bearer {{token}}`
  - Content-Type: application/json
- Body (raw JSON):
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

#### Request 5: UPDATE CUSTOMER
- Method: PUT
- URL: `{{base_url}}/api/customer/CST0001`
- Headers:
  - Authorization: `Bearer {{token}}`
  - Content-Type: application/json
- Body (raw JSON):
```json
{
  "fullname": "John Doe Updated",
  "telp": "082345678901"
}
```

#### Request 6: DELETE CUSTOMER
- Method: DELETE
- URL: `{{base_url}}/api/customer/CST0001`
- Headers:
  - Authorization: `Bearer {{token}}`

---

## 🔗 SEBELUM TESTING

1. **Pastikan Backend Berjalan:**
   ```bash
   cd C:\xampp\htdocs\sewaiphoneaja.bekasi\backend
   node index.js
   ```

2. **Login Terlebih Dahulu untuk Mendapat Token:**
   - Endpoint: `POST /auth/login`
   - Body:
     ```json
     {
       "email": "admin@example.com",
       "password": "your_password"
     }
     ```
   - Copy token dari response
   - Paste di Postman environment `{{token}}`

3. **Mulai Testing!**

---

## ✅ FILE YANG SUDAH DIBUAT

1. ✅ `backend/controllers/customer/CustomerController.js` - 6 fungsi CRUD
2. ✅ `backend/routes/customer/CustomerRoute.js` - 6 endpoint
3. ✅ `backend/helpers/generateID.js` - Update dengan generateCustomerID
4. ✅ `backend/index.js` - Update dengan import dan routing customer

---

## 🎯 TESTING CHECKLIST

- [ ] Test GET All Customers dengan pagination
- [ ] Test GET Customer by ID
- [ ] Test Search by Email
- [ ] Test CREATE Customer (cek auto-generate customer_id)
- [ ] Test UPDATE Customer
- [ ] Test DELETE Customer
- [ ] Cek validasi email/NIK unique
- [ ] Cek error handling

---

Happy Testing! 🚀
