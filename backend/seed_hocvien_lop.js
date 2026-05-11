require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// Danh sách học viên mẫu (30 người)
const HV_LIST = [
  { ho_ten: "Nguyễn Thị Lan",    email: "lan.nguyen@gmail.com",   sdt: "0901111001", gioi_tinh: "nu"  },
  { ho_ten: "Trần Văn Minh",     email: "minh.tran@gmail.com",    sdt: "0901111002", gioi_tinh: "nam" },
  { ho_ten: "Lê Thị Hoa",        email: "hoa.le@gmail.com",       sdt: "0901111003", gioi_tinh: "nu"  },
  { ho_ten: "Phạm Quốc Bảo",     email: "bao.pham@gmail.com",     sdt: "0901111004", gioi_tinh: "nam" },
  { ho_ten: "Hoàng Thị Mai",     email: "mai.hoang@gmail.com",    sdt: "0901111005", gioi_tinh: "nu"  },
  { ho_ten: "Vũ Đức Thắng",      email: "thang.vu@gmail.com",     sdt: "0901111006", gioi_tinh: "nam" },
  { ho_ten: "Đặng Thị Thu",      email: "thu.dang@gmail.com",     sdt: "0901111007", gioi_tinh: "nu"  },
  { ho_ten: "Bùi Văn Long",      email: "long.bui@gmail.com",     sdt: "0901111008", gioi_tinh: "nam" },
  { ho_ten: "Ngô Thị Hương",     email: "huong.ngo@gmail.com",    sdt: "0901111009", gioi_tinh: "nu"  },
  { ho_ten: "Đinh Quang Huy",    email: "huy.dinh@gmail.com",     sdt: "0901111010", gioi_tinh: "nam" },
  { ho_ten: "Trịnh Thị Ngọc",    email: "ngoc.trinh@gmail.com",   sdt: "0901111011", gioi_tinh: "nu"  },
  { ho_ten: "Lý Văn Tùng",       email: "tung.ly@gmail.com",      sdt: "0901111012", gioi_tinh: "nam" },
  { ho_ten: "Phan Thị Linh",     email: "linh.phan@gmail.com",    sdt: "0901111013", gioi_tinh: "nu"  },
  { ho_ten: "Cao Minh Khoa",     email: "khoa.cao@gmail.com",     sdt: "0901111014", gioi_tinh: "nam" },
  { ho_ten: "Dương Thị Yến",     email: "yen.duong@gmail.com",    sdt: "0901111015", gioi_tinh: "nu"  },
  { ho_ten: "Tô Văn Phúc",       email: "phuc.to@gmail.com",      sdt: "0901111016", gioi_tinh: "nam" },
  { ho_ten: "Lưu Thị Bích",      email: "bich.luu@gmail.com",     sdt: "0901111017", gioi_tinh: "nu"  },
  { ho_ten: "Hồ Quốc Dũng",      email: "dung.ho@gmail.com",      sdt: "0901111018", gioi_tinh: "nam" },
  { ho_ten: "Võ Thị Thanh",      email: "thanh.vo@gmail.com",     sdt: "0901111019", gioi_tinh: "nu"  },
  { ho_ten: "Mai Văn Sơn",       email: "son.mai@gmail.com",      sdt: "0901111020", gioi_tinh: "nam" },
  { ho_ten: "Châu Thị Kim",      email: "kim.chau@gmail.com",     sdt: "0901111021", gioi_tinh: "nu"  },
  { ho_ten: "Đỗ Minh Tuấn",      email: "tuan.do@gmail.com",      sdt: "0901111022", gioi_tinh: "nam" },
  { ho_ten: "Nguyễn Thị Phương", email: "phuong.nguyen@gmail.com",sdt: "0901111023", gioi_tinh: "nu"  },
  { ho_ten: "Trần Hoàng Nam",    email: "nam.tran@gmail.com",     sdt: "0901111024", gioi_tinh: "nam" },
  { ho_ten: "Lê Thị Cẩm",       email: "cam.le@gmail.com",       sdt: "0901111025", gioi_tinh: "nu"  },
  { ho_ten: "Phạm Văn Đạt",      email: "dat.pham@gmail.com",     sdt: "0901111026", gioi_tinh: "nam" },
  { ho_ten: "Hoàng Thị Trang",   email: "trang.hoang@gmail.com",  sdt: "0901111027", gioi_tinh: "nu"  },
  { ho_ten: "Vũ Minh Hiếu",      email: "hieu.vu@gmail.com",      sdt: "0901111028", gioi_tinh: "nam" },
  { ho_ten: "Đặng Thị Quỳnh",    email: "quynh.dang@gmail.com",   sdt: "0901111029", gioi_tinh: "nu"  },
  { ho_ten: "Bùi Quốc Toàn",     email: "toan.bui@gmail.com",     sdt: "0901111030", gioi_tinh: "nam" },
];

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  const hashed = await bcrypt.hash("123456", 10);

  // 1. Thêm học viên nếu chưa có
  console.log("=== THÊM HỌC VIÊN ===");
  const hvIds = [];
  for (const hv of HV_LIST) {
    const [ex] = await c.execute("SELECT id FROM nguoi_dung WHERE email = ?", [hv.email]);
    if (ex.length > 0) {
      hvIds.push(ex[0].id);
    } else {
      const [r] = await c.execute(
        "INSERT INTO nguoi_dung (ho_ten, email, sdt, mat_khau, chuc_vu_id, trang_thai, gioi_tinh, created_at) VALUES (?,?,?,?,5,'hoat_dong',?,NOW())",
        [hv.ho_ten, hv.email, hv.sdt, hashed, hv.gioi_tinh]
      );
      hvIds.push(r.insertId);
      console.log(`  ✅ ${hv.ho_ten}`);
    }
  }
  console.log(`  Tổng học viên: ${hvIds.length}`);

  // 2. Lấy danh sách lớp theo trạng thái (bỏ LOP1-5 cũ)
  const [lops] = await c.execute(
    "SELECT id, ma_lop, trang_thai, si_so_hien_tai, si_so_toi_da FROM lop_hoc WHERE ma_lop NOT LIKE 'LOP%' ORDER BY trang_thai, ma_lop"
  );

  // Phân nhóm lớp
  const lopDangDienRa = lops.filter(l => l.trang_thai === "dang_dien_ra");
  const lopDangLap    = lops.filter(l => l.trang_thai === "dang_lap");
  const lopKetThuc    = lops.filter(l => l.trang_thai === "ket_thuc");

  console.log(`\nLớp đang diễn ra: ${lopDangDienRa.length}, đang lập: ${lopDangLap.length}, kết thúc: ${lopKetThuc.length}`);

  // 3. Phân chia học viên vào lớp
  // - dang_dien_ra: điền đủ si_so đã seed (đã có dk_lop_hoc từ seed cũ)
  // - dang_lap: thêm 3-6 HV mỗi lớp (đang chờ)
  // - ket_thuc: điền đủ (đã có)

  let hvIdx = 0;
  const usedHvLop = new Set(); // tránh trùng

  // Kiểm tra dk đã có
  const [existingDK] = await c.execute("SELECT hoc_vien_id, lop_hoc_id FROM dk_lop_hoc");
  existingDK.forEach(dk => usedHvLop.add(`${dk.hoc_vien_id}_${dk.lop_hoc_id}`));

  const addDK = async (hvId, lopId, trangThai = "da_xac_nhan") => {
    const key = `${hvId}_${lopId}`;
    if (usedHvLop.has(key)) return false;
    usedHvLop.add(key);
    await c.execute(
      "INSERT INTO dk_lop_hoc (hoc_vien_id, lop_hoc_id, trang_thai, ngay_dk) VALUES (?,?,?,NOW())",
      [hvId, lopId, trangThai]
    );
    return true;
  };

  const addHopDong = async (hvId, lopId, khoaHocId, hocPhi, daTra) => {
    const maHd = "HD" + Date.now() + Math.floor(Math.random() * 1000);
    await c.execute(
      "INSERT INTO hop_dong (ma_hd, hoc_vien_id, khoa_hoc_id, tong_tien, da_tra, trang_thai, created_at) VALUES (?,?,?,?,?,?,NOW())",
      [maHd, hvId, khoaHocId, hocPhi, daTra, daTra >= hocPhi ? "hoan_thanh" : "hoat_dong"]
    );
  };

  // Lấy khoa_hoc_id và hoc_phi của từng lớp
  const [lopInfo] = await c.execute(
    "SELECT l.id, l.khoa_hoc_id, k.hoc_phi FROM lop_hoc l JOIN khoa_hoc k ON l.khoa_hoc_id = k.id WHERE l.ma_lop NOT LIKE 'LOP%'"
  );
  const lopMap = {};
  lopInfo.forEach(l => { lopMap[l.id] = { khoa_hoc_id: l.khoa_hoc_id, hoc_phi: l.hoc_phi }; });

  console.log("\n=== ĐĂNG KÝ HỌC VIÊN VÀO LỚP ===");

  // Lớp đang diễn ra: thêm HV mới nếu còn chỗ (target: 8-11 HV/lớp)
  for (const lop of lopDangDienRa) {
    const target = Math.min(lop.si_so_toi_da, 8 + Math.floor(Math.random() * 4)); // 8-11
    let current = lop.si_so_hien_tai;
    let added = 0;
    while (current < target && hvIdx < hvIds.length) {
      const hvId = hvIds[hvIdx % hvIds.length];
      hvIdx++;
      const ok = await addDK(hvId, lop.id, "da_xac_nhan");
      if (ok) {
        const info = lopMap[lop.id];
        const daTra = Math.random() > 0.3 ? info.hoc_phi : Math.floor(info.hoc_phi * 0.5);
        await addHopDong(hvId, lop.id, info.khoa_hoc_id, info.hoc_phi, daTra);
        current++; added++;
      }
    }
    if (added > 0) {
      await c.execute("UPDATE lop_hoc SET si_so_hien_tai = ? WHERE id = ?", [current, lop.id]);
      console.log(`  ✅ ${lop.ma_lop}: +${added} HV → ${current}/${lop.si_so_toi_da}`);
    }
  }

  // Lớp đang lập: thêm 3-6 HV (cho_xac_nhan)
  for (const lop of lopDangLap) {
    const target = 3 + Math.floor(Math.random() * 4); // 3-6
    let added = 0;
    for (let i = 0; i < target; i++) {
      const hvId = hvIds[(hvIdx + i) % hvIds.length];
      const ok = await addDK(hvId, lop.id, "cho_xac_nhan");
      if (ok) {
        const info = lopMap[lop.id];
        await addHopDong(hvId, lop.id, info.khoa_hoc_id, info.hoc_phi, 0);
        added++;
      }
    }
    hvIdx += target;
    if (added > 0) {
      await c.execute("UPDATE lop_hoc SET si_so_hien_tai = ? WHERE id = ?", [added, lop.id]);
      console.log(`  📋 ${lop.ma_lop}: +${added} HV chờ xác nhận`);
    }
  }

  // Lớp kết thúc: điền đủ 10-12 HV (hoan_thanh)
  for (const lop of lopKetThuc) {
    const target = 10 + Math.floor(Math.random() * 3);
    let current = lop.si_so_hien_tai;
    let added = 0;
    while (current < target && hvIdx < hvIds.length * 2) {
      const hvId = hvIds[hvIdx % hvIds.length];
      hvIdx++;
      const ok = await addDK(hvId, lop.id, "hoan_thanh");
      if (ok) {
        const info = lopMap[lop.id];
        await addHopDong(hvId, lop.id, info.khoa_hoc_id, info.hoc_phi, info.hoc_phi);
        current++; added++;
      }
    }
    if (added > 0) {
      await c.execute("UPDATE lop_hoc SET si_so_hien_tai = ? WHERE id = ?", [current, lop.id]);
      console.log(`  🏁 ${lop.ma_lop}: +${added} HV hoàn thành → ${current}/${lop.si_so_toi_da}`);
    }
  }

  // Tổng kết
  const [summary] = await c.execute(
    "SELECT trang_thai, COUNT(*) as lop, SUM(si_so_hien_tai) as tong_hv FROM lop_hoc WHERE ma_lop NOT LIKE 'LOP%' GROUP BY trang_thai"
  );
  console.log("\n=== KẾT QUẢ ===");
  summary.forEach(s => console.log(`  ${s.trang_thai}: ${s.lop} lớp, ${s.tong_hv} học viên`));

  await c.end();
  console.log("\nDone!");
}

run().catch(console.error);
