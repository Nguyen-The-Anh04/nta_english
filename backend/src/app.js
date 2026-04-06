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

// ==================== DEBUG API ====================
// Xem tất cả hoa hồng
app.get("/api/debug/commissions", async (req, res) => {
  try {
    const db = require("./config/db");
    const { HoaHong } = require("./models");
    const commissions = await HoaHong.findAll({ order: [["id", "DESC"]], limit: 20 });
    res.json({ success: true, count: commissions.length, data: commissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xem tất cả đơn hàng
app.get("/api/debug/orders", async (req, res) => {
  try {
    const { DonHang, CTV, NguoiDung } = require("./models");
    const orders = await DonHang.findAll({ 
      order: [["id", "DESC"]], 
      limit: 20,
      include: [
        { model: CTV, as: "ctv", include: [{ model: NguoiDung, as: "nguoiDung" }] },
        { model: NguoiDung, as: "nguoiMua" }
      ]
    });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xem tất cả CTV
app.get("/api/debug/ctv", async (req, res) => {
  try {
    const { CTV, NguoiDung } = require("./models");
    const ctvs = await CTV.findAll({ 
      order: [["id", "DESC"]], 
      limit: 20,
      include: [{ model: NguoiDung, as: "nguoiDung" }]
    });
    res.json({ success: true, count: ctvs.length, data: ctvs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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