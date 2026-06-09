// Inspect the SQLite database from the terminal.
//   npm run db            → every table: columns, row count, and rows
//   npm run db kohvisort  → just that one table
// Proves the data lives in a real relational DB (SQLite via better-sqlite3).
import { db } from "../src/db/database.js";

const only = process.argv[2];

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
  .map((t) => t.name)
  .filter((name) => !only || name === only);

if (!tables.length) {
  console.log(only ? `Tabelit "${only}" ei leitud.` : "Andmebaasis pole tabeleid.");
  process.exit(0);
}

const short = (v) => {
  if (v === null || v === undefined) return "—";
  const s = String(v);
  return s.length > 40 ? s.slice(0, 37) + "…" : s;
};

for (const table of tables) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  const rows = db.prepare(`SELECT * FROM ${table}`).all();

  console.log(`\n━━━ ${table.toUpperCase()} (${rows.length} rida) ━━━`);
  console.log("veerud: " + cols.map((c) => `${c.name}:${c.type}`).join(", "));
  if (rows.length) {
    console.table(rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, short(v)]))));
  }
}
console.log("");
