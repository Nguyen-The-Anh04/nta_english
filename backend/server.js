const sequelize = require("./src/config/db");
const app = require("./src/app");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

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