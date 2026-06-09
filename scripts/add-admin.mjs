// Add an admin user from the command line.
//   npm run add-admin <email> <password>
// Reuses the same bcrypt hashing (12 rounds) and users repository as the app,
// so accounts created here log in exactly like the seeded admin.
import bcrypt from "bcrypt";
import { findUserByEmail, createUser } from "../src/repositories/users.js";

const [email, password] = process.argv.slice(2);

function fail(message) {
  console.error(`✖ ${message}`);
  console.error("  Kasutus: npm run add-admin <email> <parool>");
  process.exit(1);
}

if (!email || !password) fail("Anna nii e-post kui parool.");
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail(`Vigane e-post: ${email}`);
if (password.length < 12) fail("Parool peab olema vähemalt 12 tähemärki.");
if (findUserByEmail(email)) fail(`Selle e-postiga admin on juba olemas: ${email}`);

const passwordHash = await bcrypt.hash(password, 12);
const user = createUser({ email, passwordHash, role: "admin" });

console.log(`✔ Admin loodud: ${user.email} (id ${user.id}, roll ${user.role})`);
