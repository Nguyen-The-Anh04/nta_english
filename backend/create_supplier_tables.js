require("dotenv").config();
const mysql = require("mysql2/promise");

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  console.log("=== TẠO BẢNG NHÀ CUNG CẤP & HOÁ ĐƠN NHẬP ===\n");

  // 1. Bảng nhà cung cấp
  await c.execute(`
    CREATE TABLE IF NOT EXISTS nha_cung_cap (
      id INT PRIMARY KEY AUTO_INCREMENT,
      ma_ncc VARCHAR(20) NOT NULL UNIQUE,
      ten_ncc VARCHAR(255) NOT NULL,
      nguoi_lien_he VARCHAR(150),
      sdt VARCHAR(20),
      email VARCHAR(150),
      dia_chi TEXT,
      ghi_chu TEXT,
      trang_thai ENUM('hoat_dong','ngung') DEFAULT 'hoat_dong',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Tạo bảng nha_cung_cap");

  // 2. Bảng hoá đơn nhập
  await c.execute(`
    CREATE TABLE IF NOT EXISTS hoa_don_nhap (
      id INT PRIMARY KEY AUTO_INCREMENT,
      ma_hdn VARCHAR(30) NOT NULL UNIQUE,
      nha_cung_cap_id INT NOT NULL,
      nguoi_nhap_id INT,
      ngay_nhap DATE NOT NULL,
      tong_tien DECIMAL(12,0) DEFAULT 0,
      trang_thai ENUM('cho_duyet','da_nhap','huy') DEFAULT 'da_nhap',
      ghi_chu TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (nha_cung_cap_id) REFERENCES nha_cung_cap(id)
    )
  `);
  console.log("✅ Tạo bảng hoa_don_nhap");

  // 3. Bảng chi tiết hoá đơn nhập
  await c.execute(`
    CREATE TABLE IF NOT EXISTS chi_tiet_hoa_don_nhap (
      id INT PRIMARY KEY AUTO_INCREMENT,
      hoa_don_nhap_id INT NOT NULL,
      sach_id INT NOT NULL,
      so_luong INT NOT NULL DEFAULT 1,
      don_gia DECIMAL(12,0) NOT NULL,
      thanh_tien DECIMAL(12,0) GENERATED ALWAYS AS (so_luong * don_gia) STORED,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hoa_don_nhap_id) REFERENCES hoa_don_nhap(id),
      FOREIGN KEY (sach_id) REFERENCES sach(id)
    )
  `);
  console.log("✅ Tạo bảng chi_tiet_hoa_don_nhap");

  // 4. Seed nhà cung cấp mẫu
  console.log("\n=== SEED NHÀ CUNG CẤP ===");
  const nccs = [
    { ma:"NCC001", ten:"NXB Giáo Dục Việt Nam",      nguoi:"Nguyễn Văn Hùng",  sdt:"0241234567", email:"contact@nxbgd.vn",       dia_chi:"81 Trần Hưng Đạo, Hà Nội" },
    { ma:"NCC002", ten:"NXB Tổng Hợp TP.HCM",        nguoi:"Trần Thị Mai",     sdt:"0281234567", email:"info@nxbhcm.com.vn",     dia_chi:"62 Nguyễn Thị Minh Khai, Q3, TP.HCM" },
    { ma:"NCC003", ten:"Công ty Fahasa",              nguoi:"Lê Quốc Bảo",     sdt:"0281111222", email:"order@fahasa.com",        dia_chi:"60-62 Lê Lợi, Q1, TP.HCM" },
    { ma:"NCC004", ten:"Cambridge University Press",  nguoi:"David Nguyen",    sdt:"0281234999", email:"vn@cambridge.org",        dia_chi:"Tầng 5, 72 Lê Thánh Tôn, Q1, TP.HCM" },
    { ma:"NCC005", ten:"Oxford University Press VN",  nguoi:"Sarah Tran",      sdt:"0281234888", email:"vietnam@oup.com",         dia_chi:"Tầng 3, 115 Nguyễn Huệ, Q1, TP.HCM" },
  ];

  for (const ncc of nccs) {
    const [ex] = await c.execute("SELECT id FROM nha_cung_cap WHERE ma_ncc = ?", [ncc.ma]);
    if (ex.length > 0) { console.log(`  ⏭️  ${ncc.ten}`); continue; }
    await c.execute(
      "INSERT INTO nha_cung_cap (ma_ncc, ten_ncc, nguoi_lien_he, sdt, email, dia_chi) VALUES (?,?,?,?,?,?)",
      [ncc.ma, ncc.ten, ncc.nguoi, ncc.sdt, ncc.email, ncc.dia_chi]
    );
    console.log(`  ✅ ${ncc.ten}`);
  }

  // 5. Seed hoá đơn nhập mẫu
  console.log("\n=== SEED HOÁ ĐƠN NHẬP ===");
  const [nccsDb] = await c.execute("SELECT id FROM nha_cung_cap ORDER BY id LIMIT 5");
  const [sachs] = await c.execute("SELECT id, ten_sach, gia_nhap FROM sach LIMIT 10");

  const hdns = [
    { ma:"HDN2026001", ncc_idx:0, ngay:"2026-01-10", items:[{s:0,sl:50},{s:1,sl:30},{s:2,sl:40}] },
    { ma:"HDN2026002", ncc_idx:1, ngay:"2026-02-15", items:[{s:3,sl:25},{s:4,sl:35}] },
    { ma:"HDN2026003", ncc_idx:2, ngay:"2026-03-05", items:[{s:5,sl:60},{s:6,sl:20}] },
    { ma:"HDN2026004", ncc_idx:3, ngay:"2026-04-01", items:[{s:7,sl:45},{s:8,sl:30},{s:9,sl:50}] },
    { ma:"HDN2026005", ncc_idx:4, ngay:"2026-05-10", items:[{s:0,sl:30},{s:2,sl:25}] },
  ];

  for (const hdn of hdns) {
    const [ex] = await c.execute("SELECT id FROM hoa_don_nhap WHERE ma_hdn = ?", [hdn.ma]);
    if (ex.length > 0) { console.log(`  ⏭️  ${hdn.ma}`); continue; }

    const nccId = nccsDb[hdn.ncc_idx]?.id;
    if (!nccId) continue;

    // Tính tổng tiền
    let tongTien = 0;
    const validItems = hdn.items.filter(item => sachs[item.s]);
    validItems.forEach(item => {
      const gia = Number(sachs[item.s]?.gia_nhap || 50000);
      tongTien += item.sl * gia;
    });

    const [r] = await c.execute(
      "INSERT INTO hoa_don_nhap (ma_hdn, nha_cung_cap_id, ngay_nhap, tong_tien, trang_thai) VALUES (?,?,?,?,'da_nhap')",
      [hdn.ma, nccId, hdn.ngay, tongTien]
    );
    const hdnId = r.insertId;

    // Chi tiết + cập nhật tồn kho
    for (const item of validItems) {
      const sach = sachs[item.s];
      if (!sach) continue;
      const donGia = Number(sach.gia_nhap || 50000);
      await c.execute(
        "INSERT INTO chi_tiet_hoa_don_nhap (hoa_don_nhap_id, sach_id, so_luong, don_gia) VALUES (?,?,?,?)",
        [hdnId, sach.id, item.sl, donGia]
      );
      // Cộng tồn kho
      await c.execute(
        "UPDATE sach SET so_luong_ton = so_luong_ton + ? WHERE id = ?",
        [item.sl, sach.id]
      );
    }
    console.log(`  ✅ ${hdn.ma} | ${validItems.length} loại sách | ${tongTien.toLocaleString()}đ`);
  }

  // Tổng kết
  const [cnt1] = await c.execute("SELECT COUNT(*) as n FROM nha_cung_cap");
  const [cnt2] = await c.execute("SELECT COUNT(*) as n FROM hoa_don_nhap");
  const [cnt3] = await c.execute("SELECT COUNT(*) as n FROM chi_tiet_hoa_don_nhap");
  console.log(`\n=== KẾT QUẢ ===`);
  console.log(`  nha_cung_cap: ${cnt1[0].n}`);
  console.log(`  hoa_don_nhap: ${cnt2[0].n}`);
  console.log(`  chi_tiet_hoa_don_nhap: ${cnt3[0].n}`);

  await c.end();
  console.log("\nDone!");
}

run().catch(console.error);
