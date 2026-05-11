require("dotenv").config();
const mysql = require("mysql2/promise");

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  // Lớp học
  const [lops] = await c.execute(`
    SELECT l.id, l.ma_lop, l.trang_thai, l.ngay_bat_dau, l.ngay_ket_thuc,
           l.si_so_hien_tai, l.hoc_phi, l.so_buoi_tong,
           k.ten_khoa, u.ho_ten AS giao_vien
    FROM lop_hoc l
    LEFT JOIN khoa_hoc k ON l.khoa_hoc_id = k.id
    LEFT JOIN nguoi_dung u ON l.giao_vien_id = u.id
    LIMIT 30
  `);
  console.log("=== LOP HOC (" + lops.length + ") ===");
  if (lops.length === 0) {
    console.log("  (Chua co du lieu)");
  } else {
    lops.forEach(l => console.log(
      `  [${l.id}] ${l.ma_lop} | ${l.ten_khoa||'?'} | GV: ${l.giao_vien||'?'} | ${l.trang_thai} | ${l.si_so_hien_tai||0} HV | ${l.ngay_bat_dau||'?'} - ${l.ngay_ket_thuc||'?'}`
    ));
  }

  // Khóa học
  const [khs] = await c.execute("SELECT id, ten_khoa, hoc_phi FROM khoa_hoc");
  console.log("\n=== KHOA HOC (" + khs.length + ") ===");
  if (khs.length === 0) console.log("  (Chua co du lieu)");
  else khs.forEach(k => console.log(`  [${k.id}] ${k.ten_khoa} | ${Number(k.hoc_phi||0).toLocaleString()}d`));

  // Giáo viên
  const [gvs] = await c.execute("SELECT id, ho_ten FROM nguoi_dung WHERE chuc_vu_id = 3 LIMIT 10");
  console.log("\n=== GIAO VIEN (" + gvs.length + ") ===");
  if (gvs.length === 0) console.log("  (Chua co giao vien nao co chuc_vu_id=3)");
  else gvs.forEach(g => console.log(`  [${g.id}] ${g.ho_ten}`));

  // Lịch học
  const [lichs] = await c.execute("SELECT lop_hoc_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc FROM lich_hoc LIMIT 20");
  console.log("\n=== LICH HOC (" + lichs.length + ") ===");
  lichs.forEach(l => console.log(`  Lop ${l.lop_hoc_id}: ${l.thu_trong_tuan} ${l.gio_bat_dau}-${l.gio_ket_thuc}`));

  await c.end();
}

run().catch(console.error);
