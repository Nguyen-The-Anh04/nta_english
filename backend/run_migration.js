/**
 * Script chạy migration tạo/cập nhật bảng thong_bao
 * Chạy: node run_migration.js
 */

require("dotenv").config();
const mysql = require("mysql2/promise");

async function run() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST || "localhost",
      user:     process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || "nta_english",
    });

    console.log("✅ Kết nối DB thành công:", process.env.DB_NAME);

    // Lấy danh sách cột hiện có
    const [cols] = await conn.execute("DESCRIBE thong_bao");
    const existing = cols.map(c => c.Field);
    console.log("📋 Cột hiện có:", existing.join(", "));

    // Thêm các cột còn thiếu
    const toAdd = [
      { name: "nguoi_gui_id",  sql: "ADD COLUMN nguoi_gui_id INT NULL AFTER noi_dung" },
      { name: "nguoi_nhan_id", sql: "ADD COLUMN nguoi_nhan_id INT NULL AFTER nguoi_gui_id" },
      { name: "lop_hoc_id",    sql: "ADD COLUMN lop_hoc_id INT NULL AFTER nguoi_nhan_id" },
    ];

    for (const col of toAdd) {
      if (!existing.includes(col.name)) {
        await conn.execute(`ALTER TABLE thong_bao ${col.sql}`);
        console.log(`  ✅ Thêm cột: ${col.name}`);
      } else {
        console.log(`  ⏭️  Cột đã có: ${col.name}`);
      }
    }

    // Thêm index nếu chưa có
    try {
      await conn.execute("ALTER TABLE thong_bao ADD INDEX idx_nguoi_nhan (nguoi_nhan_id)");
      console.log("  ✅ Thêm index: idx_nguoi_nhan");
    } catch { console.log("  ⏭️  Index idx_nguoi_nhan đã có"); }

    try {
      await conn.execute("ALTER TABLE thong_bao ADD INDEX idx_lop_hoc (lop_hoc_id)");
      console.log("  ✅ Thêm index: idx_lop_hoc");
    } catch { console.log("  ⏭️  Index idx_lop_hoc đã có"); }

    // Kiểm tra kết quả
    const [final] = await conn.execute("DESCRIBE thong_bao");
    console.log("\n📋 Cấu trúc bảng thong_bao sau migration:");
    final.forEach(r => console.log(`  - ${r.Field} (${r.Type})`));
    console.log("\n🎉 Migration hoàn thành!");

  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
