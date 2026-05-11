require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const GV_LIST = [
  { ho_ten: "Ngô Đăng Hiếu",       email: "hieu.ngo@nta.edu.vn",    sdt: "0911000001" },
  { ho_ten: "Trương Ngọc Quỳnh",   email: "quynh.truong@nta.edu.vn", sdt: "0911000002" },
  { ho_ten: "Phạm Băng Băng",      email: "bang.pham@nta.edu.vn",    sdt: "0911000003" },
  { ho_ten: "Tô Ngọc Hân",         email: "han.to@nta.edu.vn",       sdt: "0911000004" },
  { ho_ten: "Trương Thuyết Nhãn",  email: "nhan.truong@nta.edu.vn",  sdt: "0911000005" },
];

// Phân công lớp — 1 GV có thể dạy nhiều lớp, nhiều trình độ
// Index GV: 0=Hiếu, 1=Quỳnh, 2=Băng, 3=Hân, 4=Nhãn
const LOP_GV = {
  BASE01:  0, BASE02:  1, BASE03:  2, BASE04:  3,
  PRE01:   1, PRE02:   2, PRE03:   4, PRE04:   0,
  FOUND01: 2, FOUND02: 3, FOUND03: 0,
  STAND01: 3, STAND02: 4, STAND03: 1,
  COM01:   4, COM02:   0, COM03:   2,
};

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  const hashed = await bcrypt.hash("123456", 10);

  // 1. Thêm giáo viên
  console.log("=== THÊM GIÁO VIÊN ===");
  const gvIds = [];
  for (const gv of GV_LIST) {
    const [ex] = await c.execute("SELECT id FROM nguoi_dung WHERE email = ?", [gv.email]);
    if (ex.length > 0) {
      gvIds.push(ex[0].id);
      console.log(`  ⏭️  Đã có: ${gv.ho_ten} (id=${ex[0].id})`);
    } else {
      const [r] = await c.execute(
        "INSERT INTO nguoi_dung (ho_ten, email, sdt, mat_khau, chuc_vu_id, trang_thai, created_at) VALUES (?,?,?,?,3,'hoat_dong',NOW())",
        [gv.ho_ten, gv.email, gv.sdt, hashed]
      );
      gvIds.push(r.insertId);
      console.log(`  ✅ Thêm: ${gv.ho_ten} (id=${r.insertId})`);
    }
  }

  // 2. Gán giáo viên vào lớp
  console.log("\n=== GÁN GIÁO VIÊN VÀO LỚP ===");
  for (const [maLop, gvIdx] of Object.entries(LOP_GV)) {
    const gvId = gvIds[gvIdx];
    const gvName = GV_LIST[gvIdx].ho_ten;
    const [r] = await c.execute(
      "UPDATE lop_hoc SET giao_vien_id = ? WHERE ma_lop = ?",
      [gvId, maLop]
    );
    if (r.affectedRows > 0) {
      console.log(`  ✅ ${maLop} → ${gvName}`);
    }
  }

  // 3. Tổng kết
  console.log("\n=== PHÂN CÔNG GIÁO VIÊN ===");
  for (const [i, gv] of GV_LIST.entries()) {
    const lops = Object.entries(LOP_GV).filter(([,idx])=>idx===i).map(([ma])=>ma);
    console.log(`  ${gv.ho_ten}: ${lops.join(', ')}`);
  }

  await c.end();
  console.log("\nDone!");
}

run().catch(console.error);
