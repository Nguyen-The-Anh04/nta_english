const sequelize = require("./src/config/db");

sequelize.authenticate()
  .then(() => console.log("✅ Kết nối MySQL thành công"))
  .catch(err => console.log("❌ Lỗi kết nối DB:", err));