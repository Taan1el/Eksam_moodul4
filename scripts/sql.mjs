// Run a raw SQL statement against the SQLite database from the terminal.
//   npm run sql "SELECT nimi, hind FROM kohvisort"
//   npm run sql "UPDATE kohvisort SET hind = 14.5 WHERE id = 3"
// SELECT/PRAGMA print the returned rows; INSERT/UPDATE/DELETE print how many
// rows changed. Lets you show the database directly, without the admin panel.
import { db } from "../src/db/database.js";

const sql = process.argv.slice(2).join(" ").trim();

if (!sql) {
  console.error('Anna SQL-lause, nt: npm run sql "SELECT * FROM kohvisort"');
  process.exit(1);
}

try {
  const stmt = db.prepare(sql);
  if (stmt.reader) {
    // A statement that returns rows (SELECT, PRAGMA).
    const rows = stmt.all();
    console.log(`\n${rows.length} rida:`);
    if (rows.length) console.table(rows);
  } else {
    // A write statement (INSERT/UPDATE/DELETE).
    const info = stmt.run();
    console.log(`\n✔ OK — muudetud ridu: ${info.changes}` +
      (info.lastInsertRowid ? `, uus id: ${info.lastInsertRowid}` : ""));
  }
  console.log("");
} catch (err) {
  console.error(`✖ SQL viga: ${err.message}`);
  process.exit(1);
}
