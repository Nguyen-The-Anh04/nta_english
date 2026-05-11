require("dotenv").config();
const mysql = require("mysql2/promise");

async function fix() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  const addCol = async (table, col, def) => {
    const [cols] = await c.execute(`DESCRIBE ${table}`);
    if (!cols.find(r => r.Field === col)) {
      await c.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
      console.log(`  ✅ Added ${col} to ${table}`);
    } else {
      console.log(`  ⏭️  ${table}.${col} exists`);
    }
  };

  await addCol("phieu_thu", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await addCol("phieu_chi", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

  const [pt] = await c.execute("DESCRIBE phieu_thu");
  console.log("phieu_thu:", pt.map(r=>r.Field).join(", "));
  const [pc] = await c.execute("DESCRIBE phieu_chi");
  console.log("phieu_chi:", pc.map(r=>r.Field).join(", "));

  await c.end();
  console.log("Done!");
}
fix().catch(console.error);
