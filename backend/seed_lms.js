require("dotenv").config();
const mysql = require("mysql2/promise");

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  console.log("=== SEED DỮ LIỆU LMS ===\n");

  // 1. Khóa học
  const khoaHocs = [
    { ten_khoa: "Base",       mo_ta: "Khóa Base (0 - 2.5) - Nền tảng tiếng Anh cơ bản",  hoc_phi: 6500000,  thoi_gian_thang: 2, si_so_toi_da: 12 },
    { ten_khoa: "Pre",        mo_ta: "Khóa Pre (2.5 - 3.5) - Tiếng Anh tiền IELTS",       hoc_phi: 7500000,  thoi_gian_thang: 2, si_so_toi_da: 12 },
    { ten_khoa: "Foundation", mo_ta: "Khóa Foundation (3.5 - 4.5) - Nền tảng IELTS",      hoc_phi: 8500000,  thoi_gian_thang: 3, si_so_toi_da: 12 },
    { ten_khoa: "Standard",   mo_ta: "Khóa Standard (4.5 - 5.5) - IELTS chuẩn",           hoc_phi: 9500000,  thoi_gian_thang: 3, si_so_toi_da: 12 },
    { ten_khoa: "Complete",   mo_ta: "Khóa Complete (5.5 - 6.5) - IELTS hoàn chỉnh",      hoc_phi: 11000000, thoi_gian_thang: 4, si_so_toi_da: 12 },
  ];

  const khIds = {};
  for (const kh of khoaHocs) {
    const [existing] = await c.execute("SELECT id FROM khoa_hoc WHERE ten_khoa = ?", [kh.ten_khoa]);
    if (existing.length > 0) {
      await c.execute("UPDATE khoa_hoc SET mo_ta=?, hoc_phi=?, thoi_gian_thang=?, si_so_toi_da=? WHERE ten_khoa=?",
        [kh.mo_ta, kh.hoc_phi, kh.thoi_gian_thang, kh.si_so_toi_da, kh.ten_khoa]);
      khIds[kh.ten_khoa] = existing[0].id;
      console.log(`  ⏭️  Khóa học đã có: ${kh.ten_khoa} (id=${existing[0].id})`);
    } else {
      const [r] = await c.execute(
        "INSERT INTO khoa_hoc (ma_khoa, ten_khoa, mo_ta, hoc_phi, thoi_gian_thang, si_so_toi_da, trang_thai, created_at) VALUES (?,?,?,?,?,?,'dang_mo',NOW())",
        [kh.ten_khoa.toUpperCase().slice(0,10), kh.ten_khoa, kh.mo_ta, kh.hoc_phi, kh.thoi_gian_thang, kh.si_so_toi_da]
      );
      khIds[kh.ten_khoa] = r.insertId;
      console.log(`  ✅ Thêm khóa học: ${kh.ten_khoa} (id=${r.insertId})`);
    }
  }

  // 2. Lấy giáo viên
  const [gvs] = await c.execute("SELECT id, ho_ten FROM nguoi_dung WHERE chuc_vu_id = 3 LIMIT 5");
  if (gvs.length === 0) { console.log("\n❌ Không có giáo viên (chuc_vu_id=3). Dừng."); await c.end(); return; }
  console.log(`\n  Giáo viên có: ${gvs.map(g => g.ho_ten).join(', ')}`);
  const gvId = (i) => gvs[i % gvs.length].id;

  // 3. Lớp học — tên format: BASE01, BASE02, PRE01, PRE02... tuần tự rõ ràng
  const today = new Date();
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r.toISOString().split('T')[0]; };
  const subDays = (d, n) => addDays(d, -n);

  const lops = [
    // ── BASE ──────────────────────────────────────────────────────────────────
    { ma_lop:"BASE01", khoa:"Base", gv:0, start:subDays(today,30),  end:addDays(today,30),  buoi_tong:20, da_hoc:10, si_so:8,  trang_thai:"dang_dien_ra", lichs:[{thu:"Thu2",bat:"18:00",ket:"20:00"},{thu:"Thu5",bat:"18:00",ket:"20:00"}] },
    { ma_lop:"BASE02", khoa:"Base", gv:1, start:addDays(today,7),   end:addDays(today,67),  buoi_tong:20, da_hoc:0,  si_so:5,  trang_thai:"dang_lap",     lichs:[{thu:"Thu3",bat:"08:00",ket:"10:00"},{thu:"Thu6",bat:"08:00",ket:"10:00"}] },
    { ma_lop:"BASE03", khoa:"Base", gv:0, start:subDays(today,15),  end:addDays(today,45),  buoi_tong:20, da_hoc:5,  si_so:6,  trang_thai:"dang_dien_ra", lichs:[{thu:"Thu2",bat:"08:00",ket:"10:00"},{thu:"Thu4",bat:"08:00",ket:"10:00"}] },
    { ma_lop:"BASE04", khoa:"Base", gv:0, start:subDays(today,120), end:subDays(today,30),  buoi_tong:20, da_hoc:20, si_so:12, trang_thai:"ket_thuc",     lichs:[] },

    // ── PRE ───────────────────────────────────────────────────────────────────
    { ma_lop:"PRE01",  khoa:"Pre",  gv:0, start:subDays(today,45),  end:addDays(today,15),  buoi_tong:24, da_hoc:12, si_so:10, trang_thai:"dang_dien_ra", lichs:[{thu:"Thu2",bat:"19:00",ket:"21:00"},{thu:"Thu4",bat:"19:00",ket:"21:00"}] },
    { ma_lop:"PRE02",  khoa:"Pre",  gv:1, start:addDays(today,14),  end:addDays(today,74),  buoi_tong:24, da_hoc:0,  si_so:3,  trang_thai:"dang_lap",     lichs:[{thu:"Thu7",bat:"14:00",ket:"16:00"},{thu:"CNhat",bat:"14:00",ket:"16:00"}] },
    { ma_lop:"PRE03",  khoa:"Pre",  gv:0, start:subDays(today,20),  end:addDays(today,60),  buoi_tong:24, da_hoc:6,  si_so:7,  trang_thai:"dang_dien_ra", lichs:[{thu:"Thu3",bat:"18:00",ket:"20:00"},{thu:"Thu5",bat:"18:00",ket:"20:00"}] },
    { ma_lop:"PRE04",  khoa:"Pre",  gv:1, start:subDays(today,100), end:subDays(today,10),  buoi_tong:24, da_hoc:24, si_so:11, trang_thai:"ket_thuc",     lichs:[] },

    // ── FOUNDATION ────────────────────────────────────────────────────────────
    { ma_lop:"FOUND01",khoa:"Foundation",gv:0,start:subDays(today,20), end:addDays(today,70), buoi_tong:30,da_hoc:10,si_so:9, trang_thai:"dang_dien_ra",lichs:[{thu:"Thu3",bat:"18:00",ket:"20:30"},{thu:"Thu6",bat:"18:00",ket:"20:30"}] },
    { ma_lop:"FOUND02",khoa:"Foundation",gv:1,start:addDays(today,3),  end:addDays(today,93), buoi_tong:30,da_hoc:0, si_so:7, trang_thai:"dang_lap",    lichs:[{thu:"Thu2",bat:"08:00",ket:"10:30"},{thu:"Thu5",bat:"08:00",ket:"10:30"}] },
    { ma_lop:"FOUND03",khoa:"Foundation",gv:0,start:subDays(today,10), end:addDays(today,80), buoi_tong:30,da_hoc:8, si_so:8, trang_thai:"dang_dien_ra",lichs:[{thu:"Thu2",bat:"19:00",ket:"21:30"},{thu:"Thu4",bat:"19:00",ket:"21:30"}] },

    // ── STANDARD ──────────────────────────────────────────────────────────────
    { ma_lop:"STAND01",khoa:"Standard",gv:0,start:subDays(today,60), end:addDays(today,30),  buoi_tong:34,da_hoc:17,si_so:11,trang_thai:"dang_dien_ra",lichs:[{thu:"Thu4",bat:"19:00",ket:"21:30"},{thu:"Thu7",bat:"09:00",ket:"11:30"}] },
    { ma_lop:"STAND02",khoa:"Standard",gv:1,start:addDays(today,10), end:addDays(today,100), buoi_tong:34,da_hoc:0, si_so:4, trang_thai:"dang_lap",    lichs:[{thu:"Thu2",bat:"19:00",ket:"21:30"},{thu:"Thu5",bat:"19:00",ket:"21:30"}] },
    { ma_lop:"STAND03",khoa:"Standard",gv:0,start:subDays(today,25), end:addDays(today,75),  buoi_tong:34,da_hoc:12,si_so:10,trang_thai:"dang_dien_ra",lichs:[{thu:"Thu3",bat:"08:00",ket:"10:30"},{thu:"Thu5",bat:"08:00",ket:"10:30"}] },

    // ── COMPLETE ──────────────────────────────────────────────────────────────
    { ma_lop:"COM01",  khoa:"Complete",gv:0,start:subDays(today,50), end:addDays(today,50),  buoi_tong:34,da_hoc:17,si_so:10,trang_thai:"dang_dien_ra",lichs:[{thu:"Thu3",bat:"19:00",ket:"21:30"},{thu:"Thu6",bat:"19:00",ket:"21:30"}] },
    { ma_lop:"COM02",  khoa:"Complete",gv:1,start:addDays(today,5),  end:addDays(today,95),  buoi_tong:34,da_hoc:0, si_so:6, trang_thai:"dang_lap",    lichs:[{thu:"Thu4",bat:"08:00",ket:"10:30"},{thu:"CNhat",bat:"08:00",ket:"10:30"}] },
    { ma_lop:"COM03",  khoa:"Complete",gv:0,start:subDays(today,15), end:addDays(today,65),  buoi_tong:34,da_hoc:10,si_so:8, trang_thai:"dang_dien_ra",lichs:[{thu:"Thu2",bat:"18:00",ket:"20:30"},{thu:"Thu5",bat:"18:00",ket:"20:30"}] },
  ];

  // Xóa lớp cũ có tên format cũ (có khoảng trắng) để tránh trùng
  const oldNames = [
    "BASE 01","BASE 02","BASE 03","BASE 00",
    "PRE 04","PRE 05","PRE 06","PRE 07",
    "FOUND 08","FOUND 09","FOUND 10",
    "STAND 11","STAND 12","STAND 13",
    "COM 07","COM 08","COM 09",
  ];
  console.log("\n=== XÓA LỚP CŨ (format cũ) ===");
  for (const name of oldNames) {
    const [ex] = await c.execute("SELECT id FROM lop_hoc WHERE ma_lop = ?", [name]);
    if (ex.length > 0) {
      await c.execute("DELETE FROM lich_hoc WHERE lop_hoc_id = ?", [ex[0].id]);
      await c.execute("DELETE FROM hoc_vien_lop WHERE lop_hoc_id = ?", [ex[0].id]);
      await c.execute("DELETE FROM lop_hoc WHERE id = ?", [ex[0].id]);
      console.log(`  🗑️  Đã xóa lớp cũ: ${name}`);
    }
  }

  console.log("\n=== THÊM LỚP HỌC MỚI ===");
  const lopIds = {};
  for (const lop of lops) {
    const [ex] = await c.execute("SELECT id FROM lop_hoc WHERE ma_lop = ?", [lop.ma_lop]);
    if (ex.length > 0) {
      lopIds[lop.ma_lop] = ex[0].id;
      console.log(`  ⏭️  Lớp đã có: ${lop.ma_lop}`);
      continue;
    }

    const khId = khIds[lop.khoa];
    if (!khId) { console.log(`  ❌ Không tìm thấy khóa: ${lop.khoa}`); continue; }

    const [[kh]] = await c.execute("SELECT hoc_phi FROM khoa_hoc WHERE id=?", [khId]);

    const [r] = await c.execute(
      `INSERT INTO lop_hoc (ma_lop, khoa_hoc_id, giao_vien_id, ngay_bat_dau, ngay_ket_thuc,
        si_so_hien_tai, si_so_toi_da, so_buoi_tong, so_buoi_da_hoc, hoc_phi, trang_thai, created_at)
       VALUES (?,?,?,?,?,?,12,?,?,?,?,NOW())`,
      [lop.ma_lop, khId, gvId(lop.gv), lop.start, lop.end,
       lop.si_so, lop.buoi_tong, lop.da_hoc, kh.hoc_phi, lop.trang_thai]
    );
    lopIds[lop.ma_lop] = r.insertId;

    for (const lich of lop.lichs) {
      await c.execute(
        "INSERT INTO lich_hoc (lop_hoc_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc) VALUES (?,?,?,?)",
        [r.insertId, lich.thu, lich.bat, lich.ket]
      );
    }
    console.log(`  ✅ ${lop.ma_lop} | ${lop.khoa} | ${lop.trang_thai} | ${lop.si_so}/12 HV`);
  }

  // 4. Tổng kết
  const [total] = await c.execute("SELECT COUNT(*) as n FROM lop_hoc");
  const [byStatus] = await c.execute("SELECT trang_thai, COUNT(*) as n FROM lop_hoc GROUP BY trang_thai");
  console.log(`\n=== KẾT QUẢ ===`);
  console.log(`  Tổng lớp: ${total[0].n}`);
  byStatus.forEach(s => console.log(`  - ${s.trang_thai}: ${s.n} lớp`));

  await c.end();
  console.log("\nDone!");
}

run().catch(console.error);
