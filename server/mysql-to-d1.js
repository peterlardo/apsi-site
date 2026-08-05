import "dotenv/config";
import mysql from "mysql2/promise";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function esc(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "1" : "0";
  if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

async function main() {
  console.log("Connexion à MySQL local...");
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "apsi_cg",
    charset: "utf8mb4",
  });

  const [tables] = await conn.query("SHOW TABLES");
  const tableNames = tables.map((r) => Object.values(r)[0]);

  const lines = [];

  for (const table of tableNames) {
    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    if (!rows.length) continue;

    console.log(`  ${table}: ${rows.length} lignes`);

    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = cols.map((c) => esc(row[c]));
      lines.push(
        `INSERT OR IGNORE INTO ${table} (${cols.join(", ")}) VALUES (${vals.join(", ")});`
      );
    }
  }

  const outPath = path.join(__dirname, "..", "migrations", "0003_mysql_data.sql");
  fs.writeFileSync(outPath, lines.join("\n"));
  console.log(`\n${lines.length} INSERT générés → ${outPath}`);

  await conn.end();
}

main().catch((e) => {
  console.error("Erreur:", e.message);
  process.exit(1);
});
