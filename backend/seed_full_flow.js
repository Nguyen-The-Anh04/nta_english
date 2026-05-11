/**
 * SEED LUỒNG HOẠT ĐỘNG ĐẦY ĐỦ - NTA ENGLISH
 * 
 * LUỒNG:
 * 1. Lead đăng ký tư vấn (tu_van_lead)
 * 2. Nhân viên tạo hẹn test (lich_hen_test)
 * 3. Học viên làm bài test → kết quả (bai_test, ket_qua_test)
 * 4. Tư vấn → học viên đăng ký khoá (hop_dong)
 * 5. Vào lớp học (dk_lop_hoc)
 * 6. Điểm danh các buổi (diem_danh)
 * 7. Bài tập + nộp bài (bai_tap)
 * 8. Thông báo (thong_bao)
 */

require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const rndDate = (y, m, d1, d2) => `${y}-${String(m).padStart(2,"0")}-${String(rnd(d1,d2)).padStart(2,"0")}`;
const rndTime = () => `${String(rnd(8,20)).padStart(2,"0")}:${rnd(0,1)?'00':'30'}:00`;

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  console.log("=== SEED LUỒNG HOẠT ĐỘNG ĐẦY ĐỦ ===\n");

  // Lấy dữ liệu hiện có
  const [gvs] = await c.execute("SELECT id, ho_ten FROM nguoi_dung WHERE chuc_vu_id = 3 LIMIT 5");
  const [hvs] = await c.execute("SELECT id, ho_ten, sdt FROM nguoi_dung WHERE chuc_vu_id = 5 LIMIT 30");
  const [lops] = await c.execute("SELECT id, ma_lop, trang_thai, khoa_hoc_id, giao_vien_id FROM lop_hoc WHERE ma_lop NOT LIKE 'LOP%' ORDER BY ma_lop");
  const [khs] = await c.execute("SELECT id, ten_khoa, hoc_phi FROM khoa_hoc WHERE trang_thai='dang_mo'");
  const [dts] = await c.execute("SELECT id, ten_de FROM de_thi LIMIT 3");
  const adminId = 1;
  const gvId = gvs[0]?.id || adminId;

  console.log(`GV: ${gvs.length}, HV: ${hvs.length}, Lớp: ${lops.length}, Khóa: ${khs.length}, Đề thi: ${dts.length}`);

  // ── BƯỚC 1: LEADS MỚI (chưa xử lý) ──
  console.log("\n=== BƯỚC 1: LEADS ===");
  const NEW_LEADS = [
    { ho_ten:"Nguyễn Minh Châu",   sdt:"0911200001", email:"chau.nguyen@gmail.com",  muc_tieu:"IELTS 6.0", nguon:"fb_ads",       trang_thai:"moi" },
    { ho_ten:"Trần Quốc Bảo",      sdt:"0911200002", email:"bao.tran@gmail.com",      muc_tieu:"IELTS 5.5", nguon:"zalo",         trang_thai:"moi" },
    { ho_ten:"Lê Thị Ngọc Anh",    sdt:"0911200003", email:"ngocanh@gmail.com",       muc_tieu:"IELTS 7.0", nguon:"landing_page", trang_thai:"da_goi" },
    { ho_ten:"Phạm Hoàng Long",     sdt:"0911200004", email:"long.pham@gmail.com",     muc_tieu:"IELTS 6.5", nguon:"fb_ads",       trang_thai:"da_goi" },
    { ho_ten:"Hoàng Thị Thu Hà",    sdt:"0911200005", email:"thuha@gmail.com",         muc_tieu:"IELTS 5.0", nguon:"walkin",       trang_thai:"da_tu_van" },
    { ho_ten:"Vũ Thanh Tùng",       sdt:"0911200006", email:"tung.vu@gmail.com",       muc_tieu:"IELTS 6.0", nguon:"fb_ads",       trang_thai:"da_tu_van" },
    { ho_ten:"Đặng Ngọc Huyền",     sdt:"0911200007", email:"huyen.dang@gmail.com",    muc_tieu:"IELTS 7.5", nguon:"fb_ads",       trang_thai:"da_test" },
    { ho_ten:"Bùi Thị Lan Anh",     sdt:"0911200008", email:"lananh@gmail.com",        muc_tieu:"IELTS 6.0", nguon:"landing_page", trang_thai:"da_test" },
    { ho_ten:"Ngô Văn Khải",        sdt:"0911200009", email:"khai.ngo@gmail.com",      muc_tieu:"IELTS 5.5", nguon:"zalo",         trang_thai:"da_dk_hoc" },
    { ho_ten:"Đinh Thị Phương",     sdt:"0911200010", email:"phuong.dinh@gmail.com",   muc_tieu:"IELTS 6.5", nguon:"fb_ads",       trang_thai:"da_dk_hoc" },
  ];

  const leadIds = [];
  for (const lead of NEW_LEADS) {
    const [ex] = await c.execute("SELECT id FROM tu_van_lead WHERE sdt = ?", [lead.sdt]);
    if (ex.length > 0) { leadIds.push(ex[0].id); continue; }
    const [r] = await c.execute(
      "INSERT INTO tu_van_lead (ho_ten, sdt, email, muc_tieu, nguon_lead, trang_thai, created_at) VALUES (?,?,?,?,?,?,NOW())",
      [lead.ho_ten, lead.sdt, lead.email, lead.muc_tieu, lead.nguon, lead.trang_thai]
    );
    leadIds.push(r.insertId);
    console.log(`  ✅ Lead: ${lead.ho_ten} (${lead.trang_thai})`);
  }

  // ── BƯỚC 2: TẠO TÀI KHOẢN HỌC VIÊN TỪ LEADS ──
  console.log("\n=== BƯỚC 2: TẠO TÀI KHOẢN HV TỪ LEADS ===");
  const hashed = await bcrypt.hash("123456", 10);
  const newHvIds = [];

  for (let i = 0; i < NEW_LEADS.length; i++) {
    const lead = NEW_LEADS[i];
    const [ex] = await c.execute("SELECT id FROM nguoi_dung WHERE sdt = ? AND chuc_vu_id = 5", [lead.sdt]);
    if (ex.length > 0) { newHvIds.push(ex[0].id); continue; }
    const [r] = await c.execute(
      "INSERT INTO nguoi_dung (ho_ten, email, sdt, mat_khau, chuc_vu_id, trang_thai, created_at) VALUES (?,?,?,?,5,'hoat_dong',NOW())",
      [lead.ho_ten, lead.email, lead.sdt, hashed]
    );
    newHvIds.push(r.insertId);
    console.log(`  ✅ Tài khoản HV: ${lead.ho_ten} (login: ${lead.sdt} / 123456)`);
  }

  // ── BƯỚC 3: HẸN TEST ──
  console.log("\n=== BƯỚC 3: HẸN TEST ===");
  const henTestData = [
    // Leads đã tư vấn → hẹn test
    { hvIdx:4, leadIdx:4, trang_thai:"hoan_thanh", thoi_gian:"2026-04-15 09:00:00", dia_diem:"Trung tâm NTA" },
    { hvIdx:5, leadIdx:5, trang_thai:"hoan_thanh", thoi_gian:"2026-04-18 14:00:00", dia_diem:"Trung tâm NTA" },
    { hvIdx:6, leadIdx:6, trang_thai:"hoan_thanh", thoi_gian:"2026-04-20 10:00:00", dia_diem:"Trung tâm NTA" },
    { hvIdx:7, leadIdx:7, trang_thai:"hoan_thanh", thoi_gian:"2026-04-22 15:00:00", dia_diem:"Trung tâm NTA" },
    // Leads mới → hẹn test sắp tới
    { hvIdx:0, leadIdx:0, trang_thai:"cho_test",   thoi_gian:"2026-05-15 09:00:00", dia_diem:"Trung tâm NTA" },
    { hvIdx:1, leadIdx:1, trang_thai:"cho_test",   thoi_gian:"2026-05-16 14:00:00", dia_diem:"Trung tâm NTA" },
    { hvIdx:2, leadIdx:2, trang_thai:"cho_test",   thoi_gian:"2026-05-17 10:00:00", dia_diem:"Trung tâm NTA" },
    { hvIdx:3, leadIdx:3, trang_thai:"cho_test",   thoi_gian:"2026-05-18 15:00:00", dia_diem:"Trung tâm NTA" },
  ];

  const henTestIds = [];
  for (const ht of henTestData) {
    const hvId = newHvIds[ht.hvIdx];
    const leadId = leadIds[ht.leadIdx];
    if (!hvId) continue;
    const [ex] = await c.execute("SELECT id FROM lich_hen_test WHERE hoc_vien_id = ? AND thoi_gian = ?", [hvId, ht.thoi_gian]);
    if (ex.length > 0) { henTestIds.push(ex[0].id); continue; }
    const [r] = await c.execute(
      "INSERT INTO lich_hen_test (hoc_vien_id, giao_vien_id, lead_id, dia_diem, thoi_gian, trang_thai, created_at) VALUES (?,?,?,?,?,?,NOW())",
      [hvId, gvId, leadId, ht.dia_diem, ht.thoi_gian, ht.trang_thai]
    );
    henTestIds.push(r.insertId);
    console.log(`  ✅ Hẹn test: ${NEW_LEADS[ht.hvIdx].ho_ten} - ${ht.thoi_gian} (${ht.trang_thai})`);
  }

  // ── BƯỚC 4: KẾT QUẢ BÀI TEST ──
  console.log("\n=== BƯỚC 4: KẾT QUẢ BÀI TEST ===");
  // Học viên đã hoàn thành test → có kết quả
  const testResults = [
    { hvIdx:4, nghe:5.0, doc:5.5, noi:4.5, viet:5.0, tong:5.0 },
    { hvIdx:5, nghe:4.5, doc:4.0, noi:4.0, viet:4.5, tong:4.5 },
    { hvIdx:6, nghe:6.0, doc:6.5, noi:5.5, viet:6.0, tong:6.0 },
    { hvIdx:7, nghe:5.5, doc:5.0, noi:5.0, viet:5.5, tong:5.5 },
    // Học viên cũ cũng có kết quả
    ...hvs.slice(0, 8).map((hv, i) => ({
      hvId: hv.id,
      nghe: [4.0,4.5,5.0,5.5,6.0,6.5,5.0,4.5][i],
      doc:  [4.5,5.0,5.5,6.0,5.5,7.0,5.5,5.0][i],
      noi:  [4.0,4.5,5.0,5.5,5.0,6.5,5.0,4.5][i],
      viet: [4.5,5.0,5.5,6.0,5.5,6.5,5.0,5.0][i],
      tong: [4.5,5.0,5.5,6.0,5.5,6.5,5.0,5.0][i],
    })),
  ];

  for (const tr of testResults) {
    const hvId = tr.hvId || newHvIds[tr.hvIdx];
    if (!hvId) continue;
    const [ex] = await c.execute("SELECT id FROM bai_test WHERE hoc_vien_id = ?", [hvId]);
    if (ex.length > 0) continue;
    const [r] = await c.execute(
      `INSERT INTO bai_test (hoc_vien_id, loai_test, diem_nghe, diem_doc, diem_nói, diem_viet, diem_tong, trang_thai, thoi_gian_bat_dau, thoi_gian_hoan_thanh, nguoi_tao_id)
       VALUES (?,?,?,?,?,?,?,'hoan_thanh',NOW(),NOW(),?)`,
      [hvId, 'test_dau_vao', tr.nghe, tr.doc, tr.noi, tr.viet, tr.tong, gvId]
    );
    // Thêm kết quả chi tiết
    const baiTestId = r.insertId;
    for (const [ky, diem] of [['nghe',tr.nghe],['doc',tr.doc],['noi',tr.noi],['viet',tr.viet]]) {
      await c.execute(
        "INSERT INTO ket_qua_test (bai_test_id, loai_ky_nang, band_score, nguoi_cham_id, cham_luc) VALUES (?,?,?,?,NOW())",
        [baiTestId, ky, diem, gvId]
      );
    }
    const tenHV = tr.hvId ? hvs.find(h=>h.id===tr.hvId)?.ho_ten : NEW_LEADS[tr.hvIdx]?.ho_ten;
    console.log(`  ✅ Kết quả test: ${tenHV} - Tổng: ${tr.tong}`);
  }

  // ── BƯỚC 5: ĐIỂM DANH CÁC BUỔI HỌC ──
  console.log("\n=== BƯỚC 5: ĐIỂM DANH ===");
  const lopsDangDienRa = lops.filter(l => l.trang_thai === 'dang_dien_ra');

  for (const lop of lopsDangDienRa.slice(0, 5)) {
    // Lấy dk của lớp
    const [dks] = await c.execute(
      "SELECT id, hoc_vien_id FROM dk_lop_hoc WHERE lop_hoc_id = ? AND trang_thai = 'da_xac_nhan' LIMIT 8",
      [lop.id]
    );
    if (!dks.length) continue;

    // Lấy lịch học
    const [lichs] = await c.execute("SELECT id, thu_trong_tuan, gio_bat_dau FROM lich_hoc WHERE lop_hoc_id = ?", [lop.id]);
    if (!lichs.length) continue;

    // Tạo điểm danh cho 5 buổi gần nhất
    const thuMap = { Thu2:1, Thu3:2, Thu4:3, Thu5:4, Thu6:5, Thu7:6, CNhat:0 };
    let buoiCount = 0;

    for (let week = 8; week >= 1 && buoiCount < 5; week--) {
      for (const lich of lichs) {
        if (buoiCount >= 5) break;
        const dow = thuMap[lich.thu_trong_tuan];
        if (dow === undefined) continue;

        const d = new Date();
        d.setDate(d.getDate() - week * 7);
        const diff = dow - d.getDay();
        d.setDate(d.getDate() + diff);
        const ngay = d.toISOString().split('T')[0];

        for (const dk of dks) {
          const [ex] = await c.execute("SELECT id FROM diem_danh WHERE dk_lop_hoc_id = ? AND ngay = ?", [dk.id, ngay]);
          if (ex.length > 0) continue;
          const trangThai = Math.random() > 0.15 ? 'co_mat' : (Math.random() > 0.5 ? 'tre' : 'vang_mat');
          await c.execute(
            "INSERT INTO diem_danh (dk_lop_hoc_id, lich_hoc_id, ngay, trang_thai) VALUES (?,?,?,?)",
            [dk.id, lich.id, ngay, trangThai]
          );
        }
        buoiCount++;
      }
    }
    console.log(`  ✅ Điểm danh ${lop.ma_lop}: ${buoiCount} buổi × ${dks.length} HV`);
  }

  // ── BƯỚC 6: BÀI TẬP + NỘP BÀI ──
  console.log("\n=== BƯỚC 6: BÀI TẬP ===");
  const BAI_TAP_DATA = [
    { lop_idx:0, ten:"Writing Task 1 - Bar Chart",    loai:"writing",  han_nop:"2026-05-20" },
    { lop_idx:0, ten:"Writing Task 2 - Opinion Essay",loai:"writing",  han_nop:"2026-05-27" },
    { lop_idx:1, ten:"Speaking Part 2 - Hometown",    loai:"speaking", han_nop:"2026-05-21" },
    { lop_idx:2, ten:"Speaking Part 1 - Daily Life",  loai:"speaking", han_nop:"2026-05-23" },
    { lop_idx:3, ten:"Homework - Grammar Tenses",     loai:"homework", han_nop:"2026-05-19" },
    { lop_idx:4, ten:"Homework - Vocabulary Unit 5",  loai:"homework", han_nop:"2026-05-24" },
  ];

  const btIds = [];
  for (const bt of BAI_TAP_DATA) {
    const lop = lopsDangDienRa[bt.lop_idx];
    if (!lop) continue;
    const [ex] = await c.execute("SELECT id FROM bai_tap WHERE lop_hoc_id = ? AND ten_bai = ?", [lop.id, bt.ten]);
    if (ex.length > 0) { btIds.push(ex[0].id); continue; }
    const [r] = await c.execute(
      "INSERT INTO bai_tap (lop_hoc_id, giao_vien_id, ten_bai, loai_bai, han_nop, trang_thai, created_at) VALUES (?,?,?,?,?,'dang_mo',NOW())",
      [lop.id, lop.giao_vien_id || gvId, bt.ten, bt.loai, bt.han_nop]
    );
    btIds.push(r.insertId);
    console.log(`  ✅ Bài tập: ${bt.ten} (${lop.ma_lop})`);
  }

  // ── BƯỚC 7: THÔNG BÁO ──
  console.log("\n=== BƯỚC 7: THÔNG BÁO ===");
  const THONG_BAO = [
    { tieu_de:"Lịch học tuần 20/2026",              noi_dung:"Lớp BASE01 học Thứ 2 & Thứ 5, 18:00-20:00. Vui lòng đến đúng giờ.",                    loai_tb:"lop_hoc",  muc_do:"trung_binh" },
    { tieu_de:"Nhắc nộp bài tập Writing Task 1",    noi_dung:"Hạn nộp bài Writing Task 1 là 20/05/2026. Học viên chưa nộp vui lòng hoàn thành sớm.", loai_tb:"bai_tap",  muc_do:"cao" },
    { tieu_de:"Kết quả thi thử tháng 5",            noi_dung:"Kết quả thi thử IELTS tháng 5 đã được cập nhật. Vào portal để xem điểm.",              loai_tb:"he_thong", muc_do:"trung_binh" },
    { tieu_de:"Thông báo nghỉ lễ 30/4 - 1/5",       noi_dung:"Trung tâm nghỉ lễ từ 30/04 đến 01/05/2026. Lịch học sẽ được bù vào cuối tuần.",        loai_tb:"he_thong", muc_do:"cao" },
    { tieu_de:"Học phí kỳ 2 - Nhắc đóng tiền",      noi_dung:"Học viên chưa đóng học phí kỳ 2 vui lòng thanh toán trước 15/05/2026.",                loai_tb:"tu_van",   muc_do:"khẩn" },
    { tieu_de:"Khai giảng lớp PRE02 - 23/05/2026",  noi_dung:"Lớp PRE02 sẽ khai giảng ngày 23/05/2026. Học viên đã đăng ký vui lòng có mặt đúng giờ.", loai_tb:"lop_hoc", muc_do:"cao" },
  ];

  for (const tb of THONG_BAO) {
    const [ex] = await c.execute("SELECT id FROM thong_bao WHERE tieu_de = ?", [tb.tieu_de]);
    if (ex.length > 0) continue;
    await c.execute(
      "INSERT INTO thong_bao (tieu_de, noi_dung, loai_tb, muc_do_uu_tien, nguoi_gui_id, da_doc, created_at) VALUES (?,?,?,?,?,0,NOW())",
      [tb.tieu_de, tb.noi_dung, tb.loai_tb, tb.muc_do, adminId]
    );
    console.log(`  ✅ Thông báo: ${tb.tieu_de}`);
  }

  // ── TỔNG KẾT ──
  console.log("\n=== TỔNG KẾT ===");
  const tables = ['tu_van_lead','lich_hen_test','bai_test','ket_qua_test','dk_lop_hoc','hop_dong','diem_danh','bai_tap','thong_bao'];
  for (const t of tables) {
    const [r] = await c.execute(`SELECT COUNT(*) as n FROM ${t}`);
    console.log(`  ${t}: ${r[0].n} records`);
  }

  await c.end();
  console.log("\n✅ Done! Luồng hoạt động đầy đủ đã được seed.");
  console.log("\nLUỒNG:");
  console.log("  Lead → Hẹn test → Làm bài test → Kết quả → Đăng ký khoá → Vào lớp → Điểm danh → Bài tập");
}

run().catch(console.error);
