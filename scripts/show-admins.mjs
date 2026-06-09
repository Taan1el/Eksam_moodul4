// Print the admin accounts and their stored password hashes.
//   npm run show-admins
// Demonstrates that passwords are never stored in plain text — only the
// bcrypt hash ($2b$ = algorithm, $12$ = cost, then salt + hash) is kept.
import { db } from "../src/db/database.js";

const rows = db.prepare("SELECT id, email, role, password_hash FROM users ORDER BY id").all();

if (!rows.length) {
  console.log("Ühtegi admini pole.");
  process.exit(0);
}

console.log(`\nAndmebaasis ${rows.length} admin(it) — paroolid on bcrypt-räsidena:\n`);
for (const r of rows) {
  console.log(`  #${r.id} ${r.email} (${r.role})`);
  console.log(`     ${r.password_hash}\n`);
}
