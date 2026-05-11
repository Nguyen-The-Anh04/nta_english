require("dotenv").config();
const mysql = require("mysql2/promise");

async function fix() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  const addCol = async (table, col, def) => {
    const [cols] = await c.execute(`DESCRIBE ${table}`);
    if (!cols.find(r => r.Field === col)) {
      await c.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
      console.log(`  ✅ Added ${col} to ${table}`);
    } else {
      console.log(`  ⏭️  ${table}.${col} already exists`);
    }
  };

  console.log("=== FIX SCHEMA ===");

  // phieu_thu
  await addCol("phieu_thu", "phuong_thuc", "ENUM('tien_mat','chuyen_khoan','momo','vnpay') DEFAULT 'tien_mat'");
  await addCol("phieu_thu", "hop_dong_id", "INT NULL");
  await addCol("phieu_thu", "loai_thu", "VARCHAR(50) NULL");

  // phieu_chi
  await addCol("phieu_chi", "nguoi_duyet_id", "INT NULL");
  await addCol("phieu_chi", "loai_chi_col", "VARCHAR(50) NULL");

  // hop_dong — thêm updated_at nếu chưa có
  await addCol("hop_dong", "updated_at", "TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP");

  // Verify
  const [pt] = await c.execute("DESCRIBE phieu_thu");
  console.log("\nphieu_thu:", pt.map(r => r.Field).join(", "));
  const [pc] = await c.execute("DESCRIBE phieu_chi");
  console.log("phieu_chi:", pc.map(r => r.Field).join(", "));

  await c.end();
  console.log("\nDone!");
}

fix().catch(console.error);
