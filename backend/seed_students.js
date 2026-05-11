require("dotenv").config();
const mysql = require("mysql2/promise");

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  console.log("=== SEED HOC VIEN & DANG KY ===\n");

  // 1. Thêm học viên mẫu (15 học viên)
  const hocViens = [
    { ho_ten: "Nguyễn Văn An", sdt: "0901234567", email: "an@example.com" },
    { ho_ten: "Trần Thị Bình", sdt: "0902345678", email: "binh@example.com" },
    { ho_ten: "Lê Văn Cường", sdt: "0903456789", email: "cuong@example.com" },
    { ho_ten: "Phạm Thị Dung", sdt: "0904567890", email: "dung@example.com" },
    { ho_ten: "Hoàng Văn Em", sdt: "0905678901", email: "em@example.com" },
    { ho_ten: "Vũ Thị Giang", sdt: "0906789012", email: "giang@example.com" },
    { ho_ten: "Đỗ Văn Hùng", sdt: "0907890123", email: "hung@example.com" },
    { ho_ten: "Bùi Thị Hoa", sdt: "0908901234", email: "hoa@example.com" },
    { ho_ten: "Dương Văn Inh", sdt: "0909012345", email: "inh@example.com" },
    { ho_ten: "Mai Thị Kim", sdt: "0900123456", email: "kim@example.com" },
    { ho_ten: "Nguyễn Thị Lan", sdt: "0911234567", email: "lan@example.com" },
    { ho_ten: "Trần Văn Minh", sdt: "0912345678", email: "minh@example.com" },
    { ho_ten: "Lê Thị Nga", sdt: "0913456789", email: "nga@example.com" },
    { ho_ten: "Phạm Văn Oanh", sdt: "0914567890", email: "oanh@example.com" },
    { ho_ten: "Hoàng Thị Phúc", sdt: "0915678901", email: "phuc@example.com" },
  ];

  const hvIds = {};
  for (const hv of hocViens) {
    const [existing] = await c.execute("SELECT id FROM nguoi_dung WHERE email = ?", [hv.email]);
    if (existing.length > 0) {
      hvIds[hv.ho_ten] = existing[0].id;
      console.log(`  ⏭️  Học viên đã có: ${hv.ho_ten} (id=${existing[0].id})`);
    } else {
      const [r] = await c.execute(
          "INSERT INTO nguoi_dung (ho_ten, sdt, email, chuc_vu_id, mat_khau, trang_thai, created_at) VALUES (?, ?, ?, 4, '123456', 'hoat_dong', NOW())",
          [hv.ho_ten, hv.sdt, hv.email]
        );
      hvIds[hv.ho_ten] = r.insertId;
      console.log(`  ✅ Thêm học viên: ${hv.ho_ten} (id=${r.insertId})`);
    }
  }

  // 2. Lấy danh sách lớp học
  const [lops] = await c.execute("SELECT id, ma_lop, trang_thai FROM lop_hoc WHERE trang_thai IN ('dang_dien_ra', 'dang_lap')");
  console.log(`\n  Lớp học có thể đăng ký: ${lops.length} lớp`);

  // 3. Đăng ký học viên vào lớp - mỗi lớp đều có ít nhất 5 học viên, tối đa 12
  const registrations = [
    // Base - 2 lớp đang diễn ra
    { lop: "BASE01", students: ["Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em", "Vũ Thị Giang", "Đỗ Văn Hùng", "Bùi Thị Hoa"] },
    { lop: "BASE03", students: ["Dương Văn Inh", "Mai Thị Kim", "Nguyễn Thị Lan", "Trần Văn Minh", "Lê Thị Nga", "Phạm Văn Oanh"] },
    // Pre - 2 lớp đang diễn ra
    { lop: "PRE01", students: ["Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em", "Vũ Thị Giang", "Đỗ Văn Hùng", "Bùi Thị Hoa", "Dương Văn Inh", "Mai Thị Kim"] },
    { lop: "PRE03", students: ["Nguyễn Thị Lan", "Trần Văn Minh", "Lê Thị Nga", "Phạm Văn Oanh", "Hoàng Thị Phúc", "Nguyễn Văn An", "Trần Thị Bình"] },
    // Foundation - 2 lớp đang diễn ra
    { lop: "FOUND01", students: ["Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em", "Vũ Thị Giang", "Đỗ Văn Hùng", "Bùi Thị Hoa", "Dương Văn Inh"] },
    { lop: "FOUND03", students: ["Mai Thị Kim", "Nguyễn Thị Lan", "Trần Văn Minh", "Lê Thị Nga", "Phạm Văn Oanh", "Hoàng Thị Phúc", "Nguyễn Văn An"] },
    // Standard - 2 lớp đang diễn ra
    { lop: "STAND01", students: ["Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em", "Vũ Thị Giang", "Đỗ Văn Hùng", "Bùi Thị Hoa", "Dương Văn Inh", "Mai Thị Kim", "Nguyễn Thị Lan"] },
    { lop: "STAND03", students: ["Trần Văn Minh", "Lê Thị Nga", "Phạm Văn Oanh", "Hoàng Thị Phúc", "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường"] },
    // Complete - 2 lớp đang diễn ra
    { lop: "COM01", students: ["Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em", "Vũ Thị Giang", "Đỗ Văn Hùng", "Bùi Thị Hoa", "Dương Văn Inh", "Mai Thị Kim"] },
    { lop: "COM03", students: ["Nguyễn Thị Lan", "Trần Văn Minh", "Lê Thị Nga", "Phạm Văn Oanh", "Hoàng Thị Phúc", "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường"] },
  ];

  console.log("\n=== DANG KY LOP ===");
  for (const reg of registrations) {
    const lop = lops.find(l => l.ma_lop === reg.lop);
    if (!lop) {
      console.log(`  ❌ Không tìm thấy lớp: ${reg.lop}`);
      continue;
    }

    for (const ten of reg.students) {
      const hocVienId = hvIds[ten];
      if (!hocVienId) continue;

      const [existing] = await c.execute(
        "SELECT id FROM dk_lop_hoc WHERE hoc_vien_id = ? AND lop_hoc_id = ?",
        [hocVienId, lop.id]
      );

      if (existing.length > 0) {
        console.log(`  ⏭️  ${ten} đã đăng ký ${reg.lop}`);
      } else {
        await c.execute(
          "INSERT INTO dk_lop_hoc (hoc_vien_id, lop_hoc_id, trang_thai, ngay_dk) VALUES (?, ?, 'da_xac_nhan', NOW())",
          [hocVienId, lop.id]
        );
        console.log(`  ✅ ${ten} đăng ký ${reg.lop}`);
      }
    }
  }

  // 4. Cập nhật si_so_hien_tai cho các lớp
  console.log("\n=== CAP NHAT SO LUONG ===");
  for (const lop of lops) {
    const [count] = await c.execute(
      "SELECT COUNT(*) as n FROM dk_lop_hoc WHERE lop_hoc_id = ? AND trang_thai = 'da_xac_nhan'",
      [lop.id]
    );
    await c.execute("UPDATE lop_hoc SET si_so_hien_tai = ? WHERE id = ?", [count[0].n, lop.id]);
    console.log(`  ${lop.ma_lop}: ${count[0].n} học viên`);
  }

  // 5. Tổng kết
  const [total] = await c.execute("SELECT COUNT(*) as n FROM dk_lop_hoc");
  console.log(`\n=== KET QUA ===`);
  console.log(`  Tổng đăng ký: ${total[0].n}`);

  await c.end();
  console.log("\nDone!");
}

run().catch(console.error);