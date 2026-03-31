const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path"); // 👈 thêm dòng này
const routes = require("./routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 👇 thêm đoạn này (QUAN TRỌNG)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/", (req, res) => {
  res.send("✅ API NTA English Center - Running...");
});

// Import routes
routes(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint không tồn tại",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Lỗi server",
  });
});

module.exports = app;