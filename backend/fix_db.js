require("dotenv").config();
const mysql = require("mysql2/promise");

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const fixes = [
    // Thêm gioi_tinh vào nguoi_dung
    { sql: "ALTER TABLE nguoi_dung ADD COLUMN gioi_tinh VARCHAR(10) NULL", name: "gioi_tinh" },
    // Thêm ma_hoc_vien nếu cần
    { sql: "ALTER TABLE nguoi_dung ADD COLUMN ma_hoc_vien VARCHAR(20) NULL", name: "ma_hoc_vien" },
  ];

  for (const fix of fixes) {
    try {
      await c.execute(fix.sql);
      console.log(`✅ Thêm cột: ${fix.name}`);
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") {
        console.log(`⏭️  Cột đã có: ${fix.name}`);
      } else {
        console.error(`❌ Lỗi ${fix.name}:`, e.message);
      }
    }
  }

  await c.end();
  console.log("Done!");
}

run().catch(console.error);
