const sequelize = require('./src/config/db');

const migrations = [
  ["ctv", "trang_thai", "VARCHAR(20) DEFAULT 'hoat_dong'"],
  ["rut_tien_ctv", "ten_ngan_hang", "VARCHAR(100) NULL"],
  ["rut_tien_ctv", "ten_chu_tk", "VARCHAR(255) NULL"],
  ["rut_tien_ctv", "phuong_thuc", "VARCHAR(20) DEFAULT 'bank'"],
  ["rut_tien_ctv", "ngay_duyet", "TIMESTAMP NULL"],
  ["rut_tien_ctv", "ghi_chu", "TEXT NULL"],
  ["rut_tien_ctv", "ma_giao_dich", "VARCHAR(100) NULL"],
  ["rut_tien_ctv", "nguoi_duyet_id", "INT NULL"],
];

async function run() {
  for (const [table, col, def] of migrations) {
    try {
      await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
      console.log(`✅ Added ${table}.${col}`);
    } catch (e) {
      if (e.message.includes('Duplicate column') || e.message.includes('already exists')) {
        console.log(`⏭️  ${table}.${col} already exists`);
      } else {
        console.log(`❌ ${table}.${col}: ${e.message}`);
      }
    }
  }
  process.exit(0);
}
run();
