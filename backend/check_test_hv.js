require("dotenv").config();
const mysql = require("mysql2/promise");
async function check() {
  const c = await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,database:process.env.DB_NAME});
  const [hvs] = await c.execute(
    "SELECT DISTINCT n.id, n.ho_ten, n.email, n.sdt, lht.trang_thai as test_status FROM lich_hen_test lht JOIN nguoi_dung n ON n.id = lht.hoc_vien_id WHERE lht.trang_thai != 'huy' ORDER BY n.id"
  );
  console.log("HV tu hen test:", JSON.stringify(hvs, null, 2));
  const [lops] = await c.execute("SELECT id, ma_lop, si_so_hien_tai, si_so_toi_da, khoa_hoc_id FROM lop_hoc WHERE trang_thai = 'dang_dien_ra' ORDER BY ma_lop");
  console.log("Lop dang dien ra:", lops.map(l=>l.id+":"+l.ma_lop+" "+l.si_so_hien_tai+"/"+l.si_so_toi_da).join(", "));
  await c.end();
}
check().catch(console.error);
