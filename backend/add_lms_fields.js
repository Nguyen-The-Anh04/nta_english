require("dotenv").config();
const mysql = require("mysql2/promise");

async function addCol(c, table, col, def) {
  try {
    await c.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    console.log(`✅ ${table}.${col}`);
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME") console.log(`⏭️  ${table}.${col} đã có`);
    else console.error(`❌ ${table}.${col}:`, e.message);
  }
}

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  // lop_hoc
  await addCol(c, "lop_hoc", "so_buoi_tong",   "INT DEFAULT 0");
  await addCol(c, "lop_hoc", "so_buoi_da_hoc", "INT DEFAULT 0");
  await addCol(c, "lop_hoc", "hoc_phi",         "DECIMAL(12,0) DEFAULT 0");
  await addCol(c, "lop_hoc", "hinh_anh",        "VARCHAR(500) NULL");

  // hop_dong
  await addCol(c, "hop_dong", "co_cam_ket",      "TINYINT(1) DEFAULT 0");
  await addCol(c, "hop_dong", "ghi_chu",         "TEXT NULL");
  await addCol(c, "hop_dong", "so_khoa_dang_ky", "INT DEFAULT 1");

  await c.end();
  console.log("\n🎉 Xong!");
}

run().catch(console.error);
