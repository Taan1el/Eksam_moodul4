import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./database.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const moduleRoot = path.resolve(currentDir, "../..");
const sharedSeedPath = path.resolve(moduleRoot, "../shared-data/seed.sql");

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

db.exec(schema);

if (!fs.existsSync(sharedSeedPath)) {
  throw new Error(`Seed file not found: ${sharedSeedPath}`);
}

db.exec("DROP TABLE IF EXISTS kohvisort;");
db.exec(fs.readFileSync(sharedSeedPath, "utf8"));

console.log("Database migrated and seeded.");
