/**
 * Creates the admin account, or resets its password and role if it exists.
 *
 * There is no public sign-up any more (bookers need no account), so this is
 * how the first admin gets in. The password is hashed with bcrypt here, the
 * same way the API does it, so it never touches the database in plain text.
 *
 * Runs inside the backend container, where mysql2, bcrypt and the DB_* env vars
 * already are:
 *   docker compose cp seed/create-admin.js backend:/app/create-admin.js
 *   docker compose exec -T -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... backend node /app/create-admin.js
 */
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10; // matches createUserRepo
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || "ผู้ดูแลระบบ";
const department = "คณะวิทยาศาสตร์และเทคโนโลยี";

async function main() {
  if (!email || !password || password.length < 8) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) are required");
    process.exit(1);
  }

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    charset: "utf8mb4",
  });

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [rows] = await db.execute("SELECT user_id FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      await db.execute(
        "UPDATE users SET password = ?, role = 'admin', username = ? WHERE email = ?",
        [hash, name, email]
      );
      console.log(`  updated admin ${email}`);
    } else {
      await db.execute(
        "INSERT INTO users (email, password, username, department, role) VALUES (?, ?, ?, ?, 'admin')",
        [email, hash, name, department]
      );
      console.log(`  created admin ${email}`);
    }
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
