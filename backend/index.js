require("dotenv").config();
const userRoutes = require("./routes/auth/AuthRoute");
const unitRoutes = require("./routes/admin/UnitRoute");

const express = require("express");
const cors = require("cors"); // import cors
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

app.use(express.json());

app.use("/auth", userRoutes);

app.use("/api/units", unitRoutes);

app.get("/", (req, res) => {
  res.send("Server Node.js + MySQL jalan!");
});

app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
