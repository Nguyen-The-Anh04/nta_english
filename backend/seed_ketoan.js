require("dotenv").config();
const mysql = require("mysql2/promise");

// Tạo ngày trong khoảng tháng/năm
const rndDate = (y, m, d1, d2) => {
  const d = d1 + Math.floor(Math.random() * (d2 - d1 + 1));
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
};
const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  console.log("=== SEED DỮ LIỆU KẾ TOÁN ===\n");

  // Lấy học viên
  const [hvs] = await c.execute("SELECT id, ho_ten FROM nguoi_dung WHERE chuc_vu_id = 5 LIMIT 30");
  const [khs] = await c.execute("SELECT id, ten_khoa, hoc_phi FROM khoa_hoc WHERE trang_thai = 'dang_mo'");

  console.log(`HV: ${hvs.length}, Khóa: ${khs.length}`);

  // ── 1. HỢP ĐỒNG: học viên đăng ký 2 khóa, chỉ đóng 1 khóa (công nợ) ──
  console.log("\n=== HỢP ĐỒNG CÔNG NỢ ===");
  const congNoHVs = hvs.slice(0, 12); // 12 HV có công nợ

  for (const hv of congNoHVs) {
    // Chọn 2 khóa ngẫu nhiên
    const kh1 = khs[rnd(0, khs.length-1)];
    const kh2 = khs[rnd(0, khs.length-1)];
    const tongTien = Number(kh1.hoc_phi) + Number(kh2.hoc_phi);
    const daTra = Number(kh1.hoc_phi); // chỉ đóng 1 khóa
    const conNo = tongTien - daTra;

    // Kiểm tra đã có HD chưa
    const [ex] = await c.execute(
      "SELECT id FROM hop_dong WHERE hoc_vien_id = ? AND khoa_hoc_id = ? AND so_khoa_dang_ky = 2",
      [hv.id, kh1.id]
    );
    if (ex.length > 0) { console.log(`  ⏭️  ${hv.ho_ten} đã có HD`); continue; }

    const maHd = "HD" + Date.now() + rnd(100,999);
    const ngayKy = rndDate(2026, rnd(1,5), 1, 28);
    await c.execute(
      `INSERT INTO hop_dong (ma_hd, hoc_vien_id, khoa_hoc_id, tong_tien, da_tra,
        so_ky_nop, so_khoa_dang_ky, trang_thai, ngay_ky, ghi_chu, created_at)
       VALUES (?,?,?,?,?,2,2,'hoat_dong',?,?,NOW())`,
      [maHd, hv.id, kh1.id, tongTien, daTra, ngayKy,
       `Đăng ký ${kh1.ten_khoa} + ${kh2.ten_khoa}`]
    );
    console.log(`  ✅ ${hv.ho_ten}: ${kh1.ten_khoa}+${kh2.ten_khoa} | Tổng: ${tongTien.toLocaleString()} | Còn nợ: ${conNo.toLocaleString()}`);
  }

  // ── 2. PHIẾU THU: học phí các tháng ──
  console.log("\n=== PHIẾU THU ===");

  // Lấy HV có id để làm nguoi_nop
  const adminId = 1;

  const PHIEU_THU_DATA = [
    // Tháng 1
    { thang:1, noi_dung:"Thu học phí khóa Base - Nguyễn Thị Lan",    tien:6500000,  phuong_thuc:"tien_mat",     hv_idx:0 },
    { thang:1, noi_dung:"Thu học phí khóa Pre - Trần Văn Minh",       tien:7500000,  phuong_thuc:"chuyen_khoan", hv_idx:1 },
    { thang:1, noi_dung:"Thu học phí khóa Foundation - Lê Thị Hoa",   tien:8500000,  phuong_thuc:"tien_mat",     hv_idx:2 },
    { thang:1, noi_dung:"Thu học phí khóa Standard - Phạm Quốc Bảo",  tien:9500000,  phuong_thuc:"momo",         hv_idx:3 },
    // Tháng 2
    { thang:2, noi_dung:"Thu học phí khóa Complete - Hoàng Thị Mai",  tien:11000000, phuong_thuc:"chuyen_khoan", hv_idx:4 },
    { thang:2, noi_dung:"Thu học phí khóa Base - Vũ Đức Thắng",       tien:6500000,  phuong_thuc:"tien_mat",     hv_idx:5 },
    { thang:2, noi_dung:"Thu học phí khóa Pre - Đặng Thị Thu",        tien:7500000,  phuong_thuc:"vnpay",        hv_idx:6 },
    { thang:2, noi_dung:"Thu học phí khóa Foundation - Bùi Văn Long",  tien:8500000,  phuong_thuc:"tien_mat",     hv_idx:7 },
    // Tháng 3
    { thang:3, noi_dung:"Thu học phí khóa Standard - Ngô Thị Hương",  tien:9500000,  phuong_thuc:"chuyen_khoan", hv_idx:8 },
    { thang:3, noi_dung:"Thu học phí khóa Complete - Đinh Quang Huy",  tien:11000000, phuong_thuc:"tien_mat",     hv_idx:9 },
    { thang:3, noi_dung:"Thu học phí khóa Base - Trịnh Thị Ngọc",     tien:6500000,  phuong_thuc:"momo",         hv_idx:10 },
    { thang:3, noi_dung:"Thu học phí khóa Pre - Lý Văn Tùng",         tien:7500000,  phuong_thuc:"tien_mat",     hv_idx:11 },
    { thang:3, noi_dung:"Thu học phí khóa Foundation - Phan Thị Linh", tien:8500000,  phuong_thuc:"chuyen_khoan", hv_idx:12 },
    // Tháng 4
    { thang:4, noi_dung:"Thu học phí khóa Standard - Cao Minh Khoa",  tien:9500000,  phuong_thuc:"tien_mat",     hv_idx:13 },
    { thang:4, noi_dung:"Thu học phí khóa Complete - Dương Thị Yến",  tien:11000000, phuong_thuc:"chuyen_khoan", hv_idx:14 },
    { thang:4, noi_dung:"Thu học phí khóa Base - Tô Văn Phúc",        tien:6500000,  phuong_thuc:"tien_mat",     hv_idx:15 },
    { thang:4, noi_dung:"Thu học phí khóa Pre - Lưu Thị Bích",        tien:7500000,  phuong_thuc:"vnpay",        hv_idx:16 },
    { thang:4, noi_dung:"Thu học phí khóa Foundation - Hồ Quốc Dũng", tien:8500000,  phuong_thuc:"tien_mat",     hv_idx:17 },
    // Tháng 5
    { thang:5, noi_dung:"Thu học phí khóa Standard - Võ Thị Thanh",   tien:9500000,  phuong_thuc:"chuyen_khoan", hv_idx:18 },
    { thang:5, noi_dung:"Thu học phí khóa Complete - Mai Văn Sơn",     tien:11000000, phuong_thuc:"tien_mat",     hv_idx:19 },
    { thang:5, noi_dung:"Thu học phí khóa Base - Châu Thị Kim",        tien:6500000,  phuong_thuc:"momo",         hv_idx:20 },
    { thang:5, noi_dung:"Thu học phí khóa Pre - Đỗ Minh Tuấn",        tien:7500000,  phuong_thuc:"tien_mat",     hv_idx:21 },
    { thang:5, noi_dung:"Thu học phí khóa Foundation - Nguyễn Thị Phương", tien:8500000, phuong_thuc:"chuyen_khoan", hv_idx:22 },
    { thang:5, noi_dung:"Thu học phí khóa Standard - Trần Hoàng Nam",  tien:9500000,  phuong_thuc:"tien_mat",     hv_idx:23 },
    // Đóng bù công nợ
    { thang:5, noi_dung:"Thu bù học phí còn nợ - Lê Thị Cẩm",         tien:9500000,  phuong_thuc:"chuyen_khoan", hv_idx:24 },
    { thang:5, noi_dung:"Thu bù học phí còn nợ - Phạm Văn Đạt",       tien:8500000,  phuong_thuc:"tien_mat",     hv_idx:25 },
  ];

  for (const pt of PHIEU_THU_DATA) {
    const hvId = hvs[pt.hv_idx % hvs.length]?.id || adminId;
    const ngay = rndDate(2026, pt.thang, 1, 28);
    const maPt = "PT" + Date.now() + rnd(100,999);
    await c.execute(
      `INSERT INTO phieu_thu (ma_phieu, nguoi_nop_id, tong_tien, noi_dung, ngay_thu, phuong_thuc, loai_thu, created_at)
       VALUES (?,?,?,?,?,?,'hoc_phi',NOW())`,
      [maPt, hvId, pt.tien, pt.noi_dung, ngay, pt.phuong_thuc]
    );
    console.log(`  ✅ PT ${pt.thang}/2026: ${pt.noi_dung.slice(0,40)} - ${pt.tien.toLocaleString()}đ`);
  }

  // ── 3. PHIẾU CHI: lương, văn phòng, hoa quả, sách ──
  console.log("\n=== PHIẾU CHI ===");

  const PHIEU_CHI_DATA = [
    // Lương GV hàng tháng
    { thang:1, noi_dung:"Lương giáo viên tháng 1/2026 - Ngô Đăng Hiếu",      tien:8000000,  loai:"luong" },
    { thang:1, noi_dung:"Lương giáo viên tháng 1/2026 - Trương Ngọc Quỳnh",  tien:7500000,  loai:"luong" },
    { thang:1, noi_dung:"Lương giáo viên tháng 1/2026 - Phạm Băng Băng",     tien:8000000,  loai:"luong" },
    { thang:2, noi_dung:"Lương giáo viên tháng 2/2026 - Ngô Đăng Hiếu",      tien:8000000,  loai:"luong" },
    { thang:2, noi_dung:"Lương giáo viên tháng 2/2026 - Tô Ngọc Hân",        tien:7500000,  loai:"luong" },
    { thang:3, noi_dung:"Lương giáo viên tháng 3/2026 - Trương Thuyết Nhãn", tien:7500000,  loai:"luong" },
    { thang:3, noi_dung:"Lương giáo viên tháng 3/2026 - Phạm Băng Băng",     tien:8000000,  loai:"luong" },
    { thang:4, noi_dung:"Lương giáo viên tháng 4/2026 - Ngô Đăng Hiếu",      tien:8500000,  loai:"luong" },
    { thang:4, noi_dung:"Lương giáo viên tháng 4/2026 - Trương Ngọc Quỳnh",  tien:8000000,  loai:"luong" },
    { thang:5, noi_dung:"Lương giáo viên tháng 5/2026 - Tô Ngọc Hân",        tien:8000000,  loai:"luong" },
    { thang:5, noi_dung:"Lương giáo viên tháng 5/2026 - Trương Thuyết Nhãn", tien:7500000,  loai:"luong" },
    // Văn phòng phẩm
    { thang:1, noi_dung:"Mua sách giáo trình IELTS Cambridge 18",             tien:1200000,  loai:"van_phong" },
    { thang:2, noi_dung:"Mua sách Oxford Practice Grammar",                   tien:850000,   loai:"van_phong" },
    { thang:2, noi_dung:"Mua bút, giấy, bảng trắng văn phòng",               tien:450000,   loai:"van_phong" },
    { thang:3, noi_dung:"Mua sách IELTS Trainer 2 - Cambridge",               tien:980000,   loai:"van_phong" },
    { thang:3, noi_dung:"In tài liệu học tập tháng 3",                        tien:320000,   loai:"van_phong" },
    { thang:4, noi_dung:"Mua sách Vocabulary for IELTS Advanced",             tien:750000,   loai:"van_phong" },
    { thang:4, noi_dung:"Mua mực in, giấy A4 văn phòng",                      tien:380000,   loai:"van_phong" },
    { thang:5, noi_dung:"Mua sách Collins Writing for IELTS",                 tien:680000,   loai:"van_phong" },
    // Hoa quả, lễ rằm, mùng 1
    { thang:1, noi_dung:"Mua hoa quả cúng rằm tháng 1 (15/1 âm lịch)",       tien:350000,   loai:"khac" },
    { thang:1, noi_dung:"Mua hoa quả cúng mùng 1 tháng 1 âm lịch",           tien:280000,   loai:"khac" },
    { thang:2, noi_dung:"Mua hoa quả cúng rằm tháng 2 (15/2 âm lịch)",       tien:400000,   loai:"khac" },
    { thang:2, noi_dung:"Mua hoa quả cúng mùng 1 tháng 2 âm lịch",           tien:300000,   loai:"khac" },
    { thang:3, noi_dung:"Mua hoa quả cúng rằm tháng 3 (15/3 âm lịch)",       tien:350000,   loai:"khac" },
    { thang:3, noi_dung:"Mua hoa quả cúng mùng 1 tháng 3 âm lịch",           tien:280000,   loai:"khac" },
    { thang:4, noi_dung:"Mua hoa quả cúng rằm tháng 4 (15/4 âm lịch)",       tien:420000,   loai:"khac" },
    { thang:4, noi_dung:"Mua hoa quả cúng mùng 1 tháng 4 âm lịch",           tien:300000,   loai:"khac" },
    { thang:5, noi_dung:"Mua hoa quả cúng rằm tháng 5 (15/5 âm lịch)",       tien:380000,   loai:"khac" },
    { thang:5, noi_dung:"Mua hoa quả cúng mùng 1 tháng 5 âm lịch",           tien:290000,   loai:"khac" },
    // Chi phí khác
    { thang:1, noi_dung:"Tiền điện nước tháng 1/2026",                        tien:1800000,  loai:"van_phong" },
    { thang:2, noi_dung:"Tiền điện nước tháng 2/2026",                        tien:1650000,  loai:"van_phong" },
    { thang:3, noi_dung:"Tiền điện nước tháng 3/2026",                        tien:1900000,  loai:"van_phong" },
    { thang:4, noi_dung:"Tiền điện nước tháng 4/2026",                        tien:2100000,  loai:"van_phong" },
    { thang:5, noi_dung:"Tiền điện nước tháng 5/2026",                        tien:2200000,  loai:"van_phong" },
    { thang:3, noi_dung:"Sửa chữa điều hòa phòng học",                        tien:1500000,  loai:"khac" },
    { thang:4, noi_dung:"Mua thêm bàn ghế phòng học mới",                     tien:4500000,  loai:"khac" },
    { thang:5, noi_dung:"Chi phí marketing online tháng 5",                   tien:3000000,  loai:"khac" },
  ];

  for (const pc of PHIEU_CHI_DATA) {
    const ngay = rndDate(2026, pc.thang, 1, 28);
    const maPc = "PC" + Date.now() + rnd(100,999);
    await c.execute(
      `INSERT INTO phieu_chi (ma_phieu, nguoi_nhan_id, tong_tien, noi_dung, ngay_chi, loai_chi, created_at)
       VALUES (?,?,?,?,?,?,NOW())`,
      [maPc, adminId, pc.tien, pc.noi_dung, ngay, pc.loai]
    );
    console.log(`  ✅ PC ${pc.thang}/2026: ${pc.noi_dung.slice(0,45)} - ${pc.tien.toLocaleString()}đ`);
  }

  // ── 4. Tổng kết ──
  const [sumThu] = await c.execute("SELECT SUM(tong_tien) as s FROM phieu_thu");
  const [sumChi] = await c.execute("SELECT SUM(tong_tien) as s FROM phieu_chi");
  const [sumNo]  = await c.execute("SELECT SUM(con_no) as s FROM hop_dong WHERE trang_thai='hoat_dong'");
  const [cntNo]  = await c.execute("SELECT COUNT(*) as n FROM hop_dong WHERE trang_thai='hoat_dong' AND con_no > 0");

  console.log("\n=== KẾT QUẢ ===");
  console.log(`  Tổng thu: ${Number(sumThu[0].s||0).toLocaleString()}đ`);
  console.log(`  Tổng chi: ${Number(sumChi[0].s||0).toLocaleString()}đ`);
  console.log(`  Lợi nhuận: ${(Number(sumThu[0].s||0)-Number(sumChi[0].s||0)).toLocaleString()}đ`);
  console.log(`  Tổng công nợ: ${Number(sumNo[0].s||0).toLocaleString()}đ`);
  console.log(`  Số HV còn nợ: ${cntNo[0].n}`);

  await c.end();
  console.log("\nDone!");
}

run().catch(console.error);
