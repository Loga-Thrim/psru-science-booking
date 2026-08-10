/**
 * Inserts demo reservations directly, bypassing the API.
 *
 * The API deliberately refuses past dates and only ever creates `pending` rows,
 * so a realistic history — completed bookings, rejections, requests sitting at
 * each approval stage — can only be built by writing to the table.
 *
 * Every row is still checked against the same rules the API enforces: the date
 * must fall on a day the room opens, the times must sit inside its hours, the
 * headcount must fit, and it must not overlap an existing booking.
 *
 * Run from the project root on the server:
 *   docker compose cp seed/seed-reservations.js backend:/tmp/seed.js
 *   docker compose exec -T backend node /tmp/seed.js
 */
const mysql = require("mysql2/promise");

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * offset is in days from today; negative is the past. When that day is not one
 * the room opens, we walk outwards to the nearest day that is.
 */
const BOOKINGS = [
  // ---------- past: teaching that already happened ----------
  { room: "SC1-101", user: "wannipa.t@psru.ac.th", offset: -18, start: "09:00", end: "12:00", people: 55, type: "teaching", status: "approverApproved",
    reason: "สอนรายวิชาแคลคูลัสสำหรับวิทยาศาสตร์ หมู่เรียน 66/1", equip: "โปรเจคเตอร์, ไมค์ลอย" },
  { room: "SC1-201", user: "thanapon.s@psru.ac.th", offset: -16, start: "13:00", end: "16:00", people: 32, type: "teaching", status: "approverApproved",
    reason: "ปฏิบัติการเคมีทั่วไป 1 บทที่ 5 การไทเทรตกรด-เบส", equip: "ตู้ดูดควัน, เครื่องชั่งวิเคราะห์" },
  { room: "SC2-301", user: "nattapon.k@psru.ac.th", offset: -15, start: "08:00", end: "11:00", people: 48, type: "teaching", status: "approverApproved",
    reason: "ปฏิบัติการโครงสร้างข้อมูลและอัลกอริทึม", equip: "คอมพิวเตอร์, โปรเจคเตอร์" },
  { room: "SC2-201", user: "nanthawan.p@psru.ac.th", offset: -12, start: "13:00", end: "16:00", people: 34, type: "teaching", status: "approverApproved",
    reason: "ปฏิบัติการชีววิทยา เรื่องการแบ่งเซลล์แบบไมโทซิส", equip: "กล้องจุลทรรศน์" },
  { room: "HE-101", user: "piyanuch.s@psru.ac.th", offset: -11, start: "08:00", end: "12:00", people: 28, type: "teaching", status: "approverApproved",
    reason: "ปฏิบัติการหลักการประกอบอาหาร หน่วยที่ 3 การแปรรูปอาหาร", equip: "เตาอบ, เตาแก๊ส, ตู้เย็น" },

  // ---------- past: a rejection with a real reason ----------
  { room: "TP-901", user: "surasak.d@psru.ac.th", offset: -10, start: "09:00", end: "16:00", people: 180, type: "activity", status: "rejected",
    reason: "จัดอบรมเชิงปฏิบัติการการพัฒนาเว็บแอปพลิเคชันสำหรับนักศึกษาชั้นปีที่ 3",
    rejection: "ห้องประชุมใหญ่ถูกจองไว้สำหรับพิธีพระราชทานปริญญาบัตรในช่วงเวลาดังกล่าว ขอความอนุเคราะห์ปรับเป็นห้อง TP-401 หรือเลื่อนวันจัดกิจกรรม",
    equip: "เครื่องเสียง/ลำโพง, ไมค์ลอย, โปรเจคเตอร์" },

  // ---------- past: exams ----------
  { room: "SC2-102", user: "kittipong.s@psru.ac.th", offset: -8, start: "09:00", end: "11:00", people: 72, type: "exam", status: "approverApproved",
    reason: "สอบกลางภาค รายวิชาฟิสิกส์ทั่วไป 1 ภาคเรียนที่ 1/2569", equip: "เครื่องปรับอากาศ" },
  { room: "SC2-302", user: "surasak.d@psru.ac.th", offset: -7, start: "13:00", end: "15:00", people: 38, type: "exam", status: "approverApproved",
    reason: "สอบปฏิบัติ รายวิชาระบบฐานข้อมูล", equip: "คอมพิวเตอร์" },

  // ---------- past: faculty meeting ----------
  { room: "SC2-101", user: "porntip.j@psru.ac.th", offset: -5, start: "13:30", end: "16:00", people: 18, type: "activity", status: "approverApproved",
    reason: "ประชุมคณะกรรมการประจำคณะวิทยาศาสตร์และเทคโนโลยี ครั้งที่ 8/2569",
    equip: "ระบบ Video Conference, โต๊ะประชุม" },
  { room: "SC2-202", user: "siriporn.c@psru.ac.th", offset: -4, start: "09:00", end: "12:00", people: 22, type: "teaching", status: "approverApproved",
    reason: "ปฏิบัติการจุลชีววิทยา การเพาะเลี้ยงและนับจำนวนแบคทีเรีย", equip: "ตู้ปลอดเชื้อ (Laminar Flow), ตู้บ่มเพาะเชื้อ" },

  // ---------- this week: already fully approved ----------
  { room: "SC1-101", user: "wannipa.t@psru.ac.th", offset: 1, start: "09:00", end: "12:00", people: 55, type: "teaching", status: "approverApproved",
    reason: "สอนรายวิชาแคลคูลัสสำหรับวิทยาศาสตร์ หมู่เรียน 66/1", equip: "โปรเจคเตอร์, ไมค์ลอย" },
  { room: "SC2-301", user: "nattapon.k@psru.ac.th", offset: 1, start: "13:00", end: "16:00", people: 45, type: "teaching", status: "approverApproved",
    reason: "ปฏิบัติการการเขียนโปรแกรมเชิงวัตถุ สัปดาห์ที่ 9", equip: "คอมพิวเตอร์, กระดานอัจฉริยะ (Smart Board)" },
  { room: "SC2-401", user: "chonticha.t@psru.ac.th", offset: 2, start: "09:00", end: "12:00", people: 26, type: "teaching", status: "approverApproved",
    reason: "ปฏิบัติการการวิเคราะห์ข้อมูลด้วยภาษาไพทอน", equip: "คอมพิวเตอร์" },
  { room: "PH-201", user: "orathai.p@psru.ac.th", offset: 2, start: "13:00", end: "16:00", people: 32, type: "teaching", status: "approverApproved",
    reason: "ฝึกปฏิบัติการคัดกรองสุขภาพเบื้องต้นสำหรับงานอนามัยชุมชน", equip: "เครื่องวัดความดันโลหิต, ชุดตรวจสุขภาพเบื้องต้น" },

  // ---------- waiting on the approver (admin already checked) ----------
  { room: "SC2-102", user: "methawee.r@psru.ac.th", offset: 4, start: "08:30", end: "12:00", people: 65, type: "activity", status: "adminApproved",
    reason: "สัมมนาวิชาการ หัวข้อการจัดการคุณภาพน้ำในลุ่มน้ำน่าน โดยวิทยากรจากกรมควบคุมมลพิษ",
    equip: "โปรเจคเตอร์, เครื่องเสียง/ลำโพง, ไมค์ลอย, โพเดียม/แท่นบรรยาย" },
  { room: "TP-401", user: "nattapon.k@psru.ac.th", offset: 6, start: "09:00", end: "16:00", people: 55, type: "activity", status: "adminApproved",
    reason: "อบรมเชิงปฏิบัติการเตรียมความพร้อมสหกิจศึกษา สำหรับนักศึกษาชั้นปีที่ 3 สาขาวิทยาการคอมพิวเตอร์",
    equip: "โปรเจคเตอร์, ไมค์ลอย, เก้าอี้จัดเลี้ยง" },
  { room: "SC1-201", user: "thanapon.s@psru.ac.th", offset: 7, start: "13:00", end: "16:00", people: 30, type: "teaching", status: "adminApproved",
    reason: "ปฏิบัติการเคมีอินทรีย์ การสกัดสารจากพืชสมุนไพรท้องถิ่น", equip: "ตู้ดูดควัน" },

  // ---------- waiting on the admin ----------
  { room: "SC2-101", user: "siriporn.c@psru.ac.th", offset: 3, start: "10:00", end: "12:00", people: 12, type: "activity", status: "pending",
    reason: "ประชุมกลุ่มวิจัยจุลชีววิทยาประยุกต์ เตรียมข้อเสนอโครงการวิจัยงบประมาณปี 2570",
    equip: "ระบบ Video Conference" },
  { room: "SC1-102", user: "kittipong.s@psru.ac.th", offset: 5, start: "13:00", end: "16:00", people: 40, type: "teaching", status: "pending",
    reason: "สอนชดเชยรายวิชาฟิสิกส์ทั่วไป 2 เนื่องจากตรงกับวันหยุดนักขัตฤกษ์", equip: "โปรเจคเตอร์, กระดานไวท์บอร์ด" },
  { room: "SC2-202", user: "siriporn.c@psru.ac.th", offset: 8, start: "09:00", end: "12:00", people: 20, type: "teaching", status: "pending",
    reason: "ปฏิบัติการจุลชีววิทยาทางอาหาร การตรวจหาเชื้อโคลิฟอร์มในตัวอย่างน้ำ",
    equip: "ตู้ปลอดเชื้อ (Laminar Flow), เครื่องนึ่งฆ่าเชื้อ" },
  { room: "HE-102", user: "piyanuch.s@psru.ac.th", offset: 9, start: "08:00", end: "12:00", people: 22, type: "teaching", status: "pending",
    reason: "ปฏิบัติการออกแบบและตัดเย็บเครื่องแต่งกาย ชิ้นงานปลายภาค", equip: "จักรเย็บผ้า, โต๊ะตัดผ้า" },
  { room: "PH-202", user: "orathai.p@psru.ac.th", offset: 9, start: "09:00", end: "12:00", people: 16, type: "teaching", status: "pending",
    reason: "ฝึกปฏิบัติหัตถการนวดเพื่อสุขภาพ สำหรับนักศึกษาสาขาบูรณาการสุขภาพ ความงาม และสปา",
    equip: "เตียงสปา, เครื่องนึ่งผ้าร้อน" },
  { room: "SC2-302", user: "surasak.d@psru.ac.th", offset: 10, start: "13:00", end: "16:00", people: 35, type: "exam", status: "pending",
    reason: "สอบปลายภาคภาคปฏิบัติ รายวิชาการพัฒนาโปรแกรมบนเว็บ", equip: "คอมพิวเตอร์" },
  { room: "SC2-402", user: "methawee.r@psru.ac.th", offset: 12, start: "08:30", end: "12:00", people: 20, type: "teaching", status: "pending",
    reason: "ปฏิบัติการวิเคราะห์คุณภาพน้ำ เก็บตัวอย่างจากแม่น้ำน่านบริเวณหน้ามหาวิทยาลัย",
    equip: "ชุดวิเคราะห์คุณภาพน้ำ, เครื่องชั่งวิเคราะห์" },
  { room: "SC1-202", user: "thanapon.s@psru.ac.th", offset: 13, start: "09:00", end: "12:00", people: 8, type: "other", status: "pending",
    reason: "นักศึกษาชั้นปีที่ 4 ใช้เครื่อง HPLC สำหรับงานวิจัยปัญหาพิเศษ เรื่องการวิเคราะห์สารสำคัญในสมุนไพร",
    equip: "เครื่อง HPLC, เครื่องชั่งวิเคราะห์" },
  { room: "SC2-102", user: "porntip.j@psru.ac.th", offset: 15, start: "13:00", end: "16:30", people: 60, type: "activity", status: "pending",
    reason: "ประชุมชี้แจงแนวปฏิบัติการประกันคุณภาพการศึกษา ระดับหลักสูตร ประจำปีการศึกษา 2569",
    equip: "โปรเจคเตอร์, ไมค์ลอย, ระบบบันทึกการประชุม" },
  { room: "TP-901", user: "nanthawan.p@psru.ac.th", offset: 20, start: "08:00", end: "16:00", people: 160, type: "activity", status: "pending",
    reason: "จัดงานสัปดาห์วิทยาศาสตร์แห่งชาติ ประจำปี 2569 นิทรรศการและการแข่งขันทักษะทางวิทยาศาสตร์",
    equip: "เครื่องเสียง/ลำโพง, ไมค์ลอย, ไมค์สาย, ระบบแสงสว่าง, โพเดียม/แท่นบรรยาย" },
];

const PHONES = {
  "thanapon.s@psru.ac.th": "0812345671",
  "nanthawan.p@psru.ac.th": "0812345672",
  "porntip.j@psru.ac.th": "0812345673",
  "kittipong.s@psru.ac.th": "0812345674",
  "siriporn.c@psru.ac.th": "0812345675",
  "wannipa.t@psru.ac.th": "0812345676",
  "nattapon.k@psru.ac.th": "0812345677",
  "piyanuch.s@psru.ac.th": "0812345678",
  "orathai.p@psru.ac.th": "0812345679",
  "surasak.d@psru.ac.th": "0812345680",
  "methawee.r@psru.ac.th": "0812345681",
  "chonticha.t@psru.ac.th": "0812345682",
  "anucha.p@psru.ac.th": "0812345683",
};

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Nearest date to `offset` that the room actually opens on. */
function resolveDate(today, offset, allowedDays) {
  for (let step = 0; step <= 6; step++) {
    for (const dir of step === 0 ? [0] : [step, -step]) {
      const d = new Date(today);
      d.setDate(d.getDate() + offset + dir);
      // Keep past bookings in the past and future ones in the future.
      const shifted = offset + dir;
      if (offset < 0 && shifted >= 0) continue;
      if (offset > 0 && shifted <= 0) continue;
      if (allowedDays.includes(DAY_KEYS[d.getDay()])) return ymd(d);
    }
  }
  return null;
}

const hhmmss = (t) => (t.length === 5 ? `${t}:00` : t);

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    charset: "utf8mb4",
    dateStrings: true,
  });

  const [[{ today }]] = await conn.query(
    "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today"
  );
  const todayDate = new Date(`${today}T00:00:00`);

  const [rooms] = await conn.execute("SELECT * FROM rooms");
  const [users] = await conn.execute("SELECT user_id, email FROM users");
  const roomBy = Object.fromEntries(rooms.map((r) => [r.room_code, r]));
  const userBy = Object.fromEntries(users.map((u) => [u.email, u.user_id]));

  let inserted = 0;
  const skipped = [];

  for (const b of BOOKINGS) {
    const room = roomBy[b.room];
    const userId = userBy[b.user];
    if (!room) { skipped.push(`${b.room}: ไม่พบห้อง`); continue; }
    if (!userId) { skipped.push(`${b.room}: ไม่พบผู้ใช้ ${b.user}`); continue; }

    const allowedDays = String(room.available_days || "mon,tue,wed,thu,fri")
      .split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
    const date = resolveDate(todayDate, b.offset, allowedDays);
    if (!date) { skipped.push(`${b.room}: หาวันที่ห้องเปิดไม่ได้`); continue; }

    const start = hhmmss(b.start);
    const end = hhmmss(b.end);

    if (b.people > Number(room.capacity)) {
      skipped.push(`${b.room}: ${b.people} คน เกินความจุ ${room.capacity}`);
      continue;
    }
    const open = String(room.available_start_time), close = String(room.available_end_time);
    if (start < open || end > close) {
      skipped.push(`${b.room} ${date}: ${start}-${end} อยู่นอกเวลา ${open}-${close}`);
      continue;
    }

    const [clash] = await conn.execute(
      `SELECT reservation_id FROM reservations
        WHERE room_id = ? AND booking_date = ? AND reservation_status <> 'rejected'
          AND start_time < ? AND end_time > ? LIMIT 1`,
      [room.room_id, date, end, start]
    );
    if (clash.length) { skipped.push(`${b.room} ${date} ${start}: ชนกับการจองอื่น`); continue; }

    await conn.execute(
      `INSERT INTO reservations
         (room_id, user_id, booking_date, start_time, end_time, number_of_users,
          reservation_type, reservation_status, reservation_reason, rejection_reason,
          phone, equipment_needs, caretaker_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        room.room_id, userId, date, start, end, b.people,
        b.type, b.status, b.reason, b.rejection ?? null,
        PHONES[b.user] ?? "0800000000", b.equip ?? "", room.caretaker ?? "",
      ]
    );
    inserted++;
    console.log(`  + ${date} ${b.start}-${b.end}  ${b.room.padEnd(9)} ${b.status.padEnd(17)} ${b.user}`);
  }

  console.log(`\nเพิ่มการจอง ${inserted} รายการ`);
  if (skipped.length) {
    console.log(`ข้าม ${skipped.length} รายการ:`);
    skipped.forEach((s) => console.log(`  - ${s}`));
  }

  const [summary] = await conn.execute(
    "SELECT reservation_status, COUNT(*) AS n FROM reservations GROUP BY reservation_status"
  );
  console.log("\nสรุปตามสถานะ:");
  summary.forEach((r) => console.log(`  ${r.reservation_status.padEnd(18)} ${r.n}`));

  await conn.end();
})().catch((e) => { console.error(e); process.exit(1); });
