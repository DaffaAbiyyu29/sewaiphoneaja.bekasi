require("dotenv").config();
const userRoutes = require("./routes/auth/AuthRoute");
const unitRoutes = require("./routes/admin/UnitRoute");
const unitCustomerRoutes = require("./routes/customer/UnitPageRoute");
const variantUnitRoutes = require("./routes/admin/VariantUnitRoute");
const priceUnitRoutes = require("./routes/admin/PriceUnitRoute");
const customerRoutes = require("./routes/customer/CustomerRoute");
const paymentRoutes = require("./routes/payment/PaymentRoute");
const rentalRoutes = require("./routes/rental/RentalRoute");
const detailrentalRoutes = require("./routes/rental/DetailRentalRoute");

const express = require("express");
const cors = require("cors"); // import cors
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// enable CORS untuk frontend port 5173
app.use(
  cors({
    // Sekarang properti origin berisi array string dari semua domain yang diizinkan
    origin: [
      "http://localhost:5173",
      "https://7w2775vk-5173.asse.devtunnels.ms",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Untuk mengizinkan pengiriman cookie/token
  })
);

// Pastikan preflight (OPTIONS) selalu dijawab dengan header CORS yang sesuai
// Fallback middleware: tambahkan header CORS untuk semua response (berguna di dev)
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  // Jika menggunakan credentials, jangan gunakan wildcard origin
  // namun untuk convenience development ini mengizinkan origin dinamis.
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

const UPLOAD_FOLDER = "public/images";
app.use("/get-image", express.static(path.join(__dirname, UPLOAD_FOLDER)));

app.use("/api/unit/catalog", unitCustomerRoutes);

app.use("/auth", userRoutes);

app.use("/api/unit", unitRoutes);
app.use("/api/unit/variant-unit", variantUnitRoutes);
app.use("/api/unit/price", priceUnitRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/rental", rentalRoutes);
app.use("/api/detailrental", detailrentalRoutes);

app.get("/", (req, res) => {
  res.send("Server Node.js + MySQL jalan!");
});

app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
