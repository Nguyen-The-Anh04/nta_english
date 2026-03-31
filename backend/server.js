const sequelize = require("./src/config/db");
const app = require("./src/app");
const express = require("express");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Debug: Log static file requests
app.use("/uploads", (req, res, next) => {
  console.log("Static file request:", req.url);
  next();
});

// Connect to database and start server
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Kết nối MySQL thành công");
    
    // Sync models (optional - only for development)
    // sequelize.sync({ alter: true }).then(() => {
    //   console.log("✅ Đồng bộ models thành công");
    // });

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Lỗi kết nối DB:", err);
  });