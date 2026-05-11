require("dotenv").config();
const mysql = require("mysql2/promise");
async function check() {
  const c = await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,database:process.env.DB_NAME});
  const [tables] = await c.execute("SHOW TABLES");
  const names = tables.map(t=>Object.values(t)[0]);
  console.log("phieu_thu:", names.includes("phieu_thu")?"OK":"MISSING");
  console.log("phieu_chi:", names.includes("phieu_chi")?"OK":"MISSING");
  console.log("hop_dong:", names.includes("hop_dong")?"OK":"MISSING");

  if (names.includes("phieu_thu")) {
    const [cols] = await c.execute("DESCRIBE phieu_thu");
    console.log("phieu_thu cols:", cols.map(c=>c.Field).join(", "));
  }
  if (names.includes("hop_dong")) {
    const [cols] = await c.execute("DESCRIBE hop_dong");
    console.log("hop_dong cols:", cols.map(c=>c.Field).join(", "));
  }

  // Test query trực tiếp
  try {
    const [r] = await c.execute("SELECT COUNT(*) as n FROM hop_dong");
    console.log("hop_dong count:", r[0].n);
  } catch(e) { console.log("hop_dong query error:", e.message); }

  try {
    const [r] = await c.execute("SELECT COUNT(*) as n FROM phieu_thu");
    console.log("phieu_thu count:", r[0].n);
  } catch(e) { console.log("phieu_thu query error:", e.message); }

  await c.end();
}
check().catch(console.error);
