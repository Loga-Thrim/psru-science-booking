import nodemailer, { Transporter } from "nodemailer";
import { RowDataPacket } from "mysql2";
import dbConnect from "../configs/dbConnect";

// Admins hear about new requests by email. Bookers usually book as guests
// (name and phone only) and check their status by phone number instead; only a
// booking an admin made while signed in has an address to reply to.
//
// Sending is best effort: a mail server outage must never fail a booking or an
// approval that has already been saved, so every public function here swallows
// its own errors.

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn("SMTP_HOST is not set: email notifications are disabled.");
    transporter = null;
    return null;
  }
  const port = Number(process.env.SMTP_PORT || 587);
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

const appUrl = () => (process.env.APP_URL || "").replace(/\/$/, "");

type Details = {
  room_code: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  username: string;
  /** Null for guest bookings, which have no account and so no address. */
  email: string | null;
  rejection_reason: string | null;
};

const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function when(d: Pick<Details, "booking_date" | "start_time" | "end_time">) {
  const [y, m, day] = d.booking_date.slice(0, 10).split("-").map(Number);
  const date = `${day} ${THAI_MONTHS[m - 1]} ${y + 543}`;
  return `${date} ${d.start_time.slice(0, 5)}–${d.end_time.slice(0, 5)} น.`;
}

async function send(to: string[], subject: string, lines: string[], linkPath: string) {
  const mailer = getTransporter();
  if (!mailer || to.length === 0) return;
  const link = appUrl() ? `${appUrl()}${linkPath}` : "";
  const text = [...lines, ...(link ? ["", link] : [])].join("\n");
  await mailer.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: to.join(", "),
    subject,
    text,
  });
}

async function emailsOfRole(role: string): Promise<string[]> {
  const connect = await dbConnect();
  try {
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT email FROM users WHERE role = ?", [role]);
    return rows.map((r) => r.email);
  } finally {
    connect.end();
  }
}

async function reservationDetails(reservationId: string): Promise<Details | null> {
  const connect = await dbConnect();
  try {
    const [rows] = await connect.execute<RowDataPacket[]>(
      `SELECT r.room_code, v.booking_date, v.start_time, v.end_time,
              COALESCE(v.booker_name, u.username) AS username, u.email, v.rejection_reason
       FROM reservations v
       JOIN rooms r ON r.room_id = v.room_id
       LEFT JOIN users u ON u.user_id = v.user_id
       WHERE v.reservation_id = ?`,
      [reservationId]
    );
    return (rows[0] as Details) ?? null;
  } finally {
    connect.end();
  }
}

function quietly(task: () => Promise<void>) {
  task().catch((err) => console.error("Email notification failed:", err));
}

/** A new request is waiting for the first review. */
export function notifyNewBooking(b: { room_id: string; booker_name: string; date: string; start_time: string; end_time: string }) {
  quietly(async () => {
    const connect = await dbConnect();
    let room_code = "";
    try {
      const [rooms] = await connect.execute<RowDataPacket[]>("SELECT room_code FROM rooms WHERE room_id = ?", [b.room_id]);
      room_code = rooms[0]?.room_code ?? "";
    } finally {
      connect.end();
    }
    const slot = when({ booking_date: b.date, start_time: b.start_time, end_time: b.end_time });
    await send(
      await emailsOfRole("admin"),
      `[จองห้อง] คำขอใหม่ ${room_code}`,
      [`${b.booker_name} ขอใช้ห้อง ${room_code}`, slot],
      "/approvals"
    );
  });
}

/** Final approval: the room is now the booker's. */
export function notifyApproved(reservationId: string) {
  quietly(async () => {
    const d = await reservationDetails(reservationId);
    if (!d) return;
    await send(
      d.email ? [d.email] : [],
      `[จองห้อง] อนุมัติแล้ว ${d.room_code}`,
      [`ห้อง ${d.room_code} อนุมัติแล้ว`, when(d)],
      "/booking-status"
    );
  });
}

export function notifyRejected(reservationId: string) {
  quietly(async () => {
    const d = await reservationDetails(reservationId);
    if (!d) return;
    await send(
      d.email ? [d.email] : [],
      `[จองห้อง] ไม่อนุมัติ ${d.room_code}`,
      [`ห้อง ${d.room_code} ไม่ได้รับอนุมัติ`, when(d), `เหตุผล: ${d.rejection_reason ?? "-"}`],
      "/booking-status"
    );
  });
}
