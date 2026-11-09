/**
 * Adds one sample booking so the calendar and approval screens are not empty.
 *
 * The booker is fictional on purpose: names are shown publicly on taken slots,
 * so the sample must not put a booking in a real person's name.
 *
 * Runs inside the backend container (see seed.sh), where mysql2 and the DB_*
 * env vars already are.
 */
const mysql = require("mysql2/promise");

const SAMPLE = {
  room_code: "SC2401",
  booker_name: "อ.สมชาย ใจดี (ตัวอย่าง)",
  phone: "0800000000",
  daysAhead: 3,
  start: "13:00:00",
  end: "15:00:00",
  people: 25,
  type: "activity",
  reason: "ประชุมสาขาวิชา (ข้อมูลตัวอย่าง)",
};

/** The next weekday at least `days` ahead, so it lands inside opening days. */
function upcomingWeekday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function main() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    charset: "utf8mb4",
  });

  try {
    const [rooms] = await db.execute("SELECT room_id FROM rooms WHERE room_code = ?", [SAMPLE.room_code]);
    if (rooms.length === 0) {
      console.log(`  skipped: room ${SAMPLE.room_code} not found`);
      return;
    }
    const date = upcomingWeekday(SAMPLE.daysAhead);

    // Re-running the seed must not stack up copies of the sample.
    const [existing] = await db.execute(
      "SELECT 1 FROM reservations WHERE room_id = ? AND phone = ? AND booking_date = ?",
      [rooms[0].room_id, SAMPLE.phone, date]
    );
    if (existing.length > 0) {
      console.log(`  sample booking already there (${date})`);
      return;
    }

    await db.execute(
      `INSERT INTO reservations
         (room_id, user_id, booker_name, booking_date, start_time, end_time, number_of_users,
          reservation_type, reservation_reason, phone, reservation_status)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [rooms[0].room_id, SAMPLE.booker_name, date, SAMPLE.start, SAMPLE.end, SAMPLE.people,
       SAMPLE.type, SAMPLE.reason, SAMPLE.phone]
    );
    console.log(`  + ${date} ${SAMPLE.start.slice(0, 5)}-${SAMPLE.end.slice(0, 5)} ${SAMPLE.room_code} pending ${SAMPLE.booker_name}`);
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
