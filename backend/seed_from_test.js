require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  console.log("=== LẤY HỌC VIÊN TỪ HẸN TEST → LỚP ĐANG DIỄN RA ===\n");

  // 1. Lấy học viên từ hẹn test (không bị hủy), distinct theo hoc_vien_id
  const [testHVs] = await c.execute(`
    SELECT DISTINCT n.id, n.ho_ten, n.email, n.sdt
    FROM lich_hen_test lht
    JOIN nguoi_dung n ON n.id = lht.hoc_vien_id
    WHERE lht.trang_thai != 'huy'
  `);
  console.log(`Học viên từ hẹn test: ${testHVs.length}`);
  testHVs.forEach(h => console.log(`  - ${h.ho_ten} (${h.sdt})`));

  // 2. Lấy leads có thông tin để tạo học viên mới (nếu chưa có trong nguoi_dung)
  const [leads] = await c.execute(`
    SELECT id, ho_ten, email, sdt, khoa_hoc_quan_tam
    FROM tu_van_lead
    WHERE trang_thai IN ('da_tu_van', 'quan_tam', 'dang_xu_ly')
    AND sdt IS NOT NULL
    LIMIT 20
  `).catch(() => [[]]);
  console.log(`\nLeads tiềm năng: ${leads.length}`);

  const hashed = await bcrypt.hash("123456", 10);
  const allHvIds = [...testHVs.map(h => h.id)];

  // Tạo học viên từ leads nếu chưa có
  for (const lead of leads) {
    if (!lead.email && !lead.sdt) continue;
    const checkField = lead.email ? "email" : "sdt";
    const checkVal = lead.email || lead.sdt;
    const [ex] = await c.execute(`SELECT id FROM nguoi_dung WHERE ${checkField} = ?`, [checkVal]);
    if (ex.length > 0) {
      if (!allHvIds.includes(ex[0].id)) allHvIds.push(ex[0].id);
    } else {
      const email = lead.email || `lead${lead.id}@nta.vn`;
      const [r] = await c.execute(
        "INSERT INTO nguoi_dung (ho_ten, email, sdt, mat_khau, chuc_vu_id, trang_thai, created_at) VALUES (?,?,?,?,5,'hoat_dong',NOW())",
        [lead.ho_ten || "Học viên", email, lead.sdt, hashed]
      );
      allHvIds.push(r.insertId);
      console.log(`  ✅ Tạo HV từ lead: ${lead.ho_ten} (${lead.sdt})`);
    }
  }

  // 3. Lấy lớp đang diễn ra còn chỗ
  const [lops] = await c.execute(`
    SELECT l.id, l.ma_lop, l.si_so_hien_tai, l.si_so_toi_da, l.khoa_hoc_id, k.hoc_phi
    FROM lop_hoc l
    JOIN khoa_hoc k ON k.id = l.khoa_hoc_id
    WHERE l.trang_thai = 'dang_dien_ra'
    AND l.si_so_hien_tai < l.si_so_toi_da
    ORDER BY l.ma_lop
  `);
  console.log(`\nLớp đang diễn ra còn chỗ: ${lops.length}`);

  // 4. Kiểm tra dk đã có
  const [existingDK] = await c.execute("SELECT hoc_vien_id, lop_hoc_id FROM dk_lop_hoc");
  const usedSet = new Set(existingDK.map(d => `${d.hoc_vien_id}_${d.lop_hoc_id}`));

  // 5. Phân học viên vào lớp — mỗi lớp thêm đến 12 HV
  console.log("\n=== ĐĂNG KÝ VÀO LỚP ĐANG DIỄN RA ===");
  let hvIdx = 0;

  for (const lop of lops) {
    let current = lop.si_so_hien_tai;
    const target = Math.min(lop.si_so_toi_da, current + 3); // thêm tối đa 3 HV/lớp
    let added = 0;

    while (current < target && hvIdx < allHvIds.length) {
      const hvId = allHvIds[hvIdx % allHvIds.length];
      hvIdx++;
      const key = `${hvId}_${lop.id}`;
      if (usedSet.has(key)) continue;
      usedSet.add(key);

      await c.execute(
        "INSERT INTO dk_lop_hoc (hoc_vien_id, lop_hoc_id, trang_thai, ngay_dk) VALUES (?,?,'da_xac_nhan',NOW())",
        [hvId, lop.id]
      );

      // Tạo hợp đồng
      const maHd = "HD" + Date.now() + Math.floor(Math.random() * 9999);
      const daTra = Math.random() > 0.4 ? lop.hoc_phi : Math.floor(lop.hoc_phi * 0.5);
      await c.execute(
        "INSERT INTO hop_dong (ma_hd, hoc_vien_id, khoa_hoc_id, tong_tien, da_tra, trang_thai, created_at) VALUES (?,?,?,?,?,?,NOW())",
        [maHd, hvId, lop.khoa_hoc_id, lop.hoc_phi, daTra, daTra >= lop.hoc_phi ? "hoan_thanh" : "hoat_dong"]
      );

      current++; added++;
    }

    if (added > 0) {
      await c.execute("UPDATE lop_hoc SET si_so_hien_tai = ? WHERE id = ?", [current, lop.id]);
      console.log(`  ✅ ${lop.ma_lop}: +${added} HV → ${current}/${lop.si_so_toi_da}`);
    }
  }

  // 6. Tổng kết
  const [summary] = await c.execute(`
    SELECT trang_thai, COUNT(*) as lop, SUM(si_so_hien_tai) as tong_hv
    FROM lop_hoc WHERE ma_lop NOT LIKE 'LOP%'
    GROUP BY trang_thai
  `);
  console.log("\n=== KẾT QUẢ ===");
  summary.forEach(s => console.log(`  ${s.trang_thai}: ${s.lop} lớp, ${s.tong_hv} học viên`));

  await c.end();
  console.log("\nDone!");
}

run().catch(console.error);
