import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { bookingStatus } from "../enum/booking";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Accepts "HH:MM" or "HH:MM:SS" and always returns "HH:MM:SS".
function normalizeTime(value: string): string | null {
    if (typeof value !== "string" || !TIME_RE.test(value.trim())) return null;
    const [h, m, s] = value.trim().split(":");
    return `${h}:${m}:${s ?? "00"}`;
}

function daysBetween(from: string, to: string): number {
    const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
    const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10));
    return Math.round((b - a) / 86400000);
}

export default async function bookingRepo(room_id: string, date: string, start_time: string, end_time: string, number_of_users: number, reservation_type: string, reservation_reason: string, phone_number: string, user_id: string, equipment_needs: string = "", caretaker_name: string = "") {
    if (!room_id || typeof room_id !== "string") return bookingStatus.invalidInput;
    if (typeof date !== "string" || !DATE_RE.test(date)) return bookingStatus.invalidInput;

    const start = normalizeTime(start_time);
    const end = normalizeTime(end_time);
    if (!start || !end) return bookingStatus.invalidInput;

    const attendees = Number(number_of_users);
    if (!Number.isInteger(attendees) || attendees < 1) return bookingStatus.invalidInput;

    if (end <= start) return bookingStatus.invalidTimeRange;

    const connect = await dbConnect();
    try {
        await connect.beginTransaction();

        // Lock the room row so two concurrent bookings for the same room are serialized.
        const [roomRows] = await connect.execute<RowDataPacket[]>(
            "SELECT room_id, capacity, status, available_start_time, available_end_time, available_days, advance_booking_days FROM rooms WHERE room_id = ? FOR UPDATE",
            [room_id]
        );
        if (roomRows.length === 0) {
            await connect.rollback();
            return bookingStatus.roomNotFound;
        }
        const room = roomRows[0];

        if (room.status && String(room.status).toLowerCase() !== "available") {
            await connect.rollback();
            return bookingStatus.roomUnavailable;
        }

        const [[{ today }]] = await connect.query<RowDataPacket[]>(
            "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today"
        ) as unknown as [RowDataPacket[], unknown];

        const offset = daysBetween(today, date);
        if (offset < 0) {
            await connect.rollback();
            return bookingStatus.pastDate;
        }

        const advance = Number(room.advance_booking_days);
        if (Number.isFinite(advance) && advance > 0 && offset > advance) {
            await connect.rollback();
            return bookingStatus.tooFarAhead;
        }

        const allowedDays = String(room.available_days || "mon,tue,wed,thu,fri")
            .split(",")
            .map((d) => d.trim().toLowerCase())
            .filter(Boolean);
        const dayKey = DAY_KEYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
        if (allowedDays.length > 0 && !allowedDays.includes(dayKey)) {
            await connect.rollback();
            return bookingStatus.dayNotAllowed;
        }

        const openAt = normalizeTime(String(room.available_start_time || "08:00:00"));
        const closeAt = normalizeTime(String(room.available_end_time || "17:00:00"));
        if (openAt && closeAt && (start < openAt || end > closeAt)) {
            await connect.rollback();
            return bookingStatus.outsideOpeningHours;
        }

        if (Number.isFinite(Number(room.capacity)) && attendees > Number(room.capacity)) {
            await connect.rollback();
            return bookingStatus.overCapacity;
        }

        // Two ranges overlap when each starts before the other ends.
        // Touching ranges (09:00-11:00 and 11:00-12:00) do not overlap.
        const [clash] = await connect.execute<RowDataPacket[]>(
            `SELECT reservation_id FROM reservations
             WHERE room_id = ?
               AND booking_date = ?
               AND reservation_status <> 'rejected'
               AND start_time < ?
               AND end_time > ?
             LIMIT 1`,
            [room_id, date, end, start]
        );
        if (clash.length > 0) {
            await connect.rollback();
            return bookingStatus.conflict;
        }

        const [result] = await connect.execute<ResultSetHeader>(
            `INSERT INTO reservations
                (room_id, user_id, booking_date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone, equipment_needs, caretaker_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [room_id, user_id, date, start, end, attendees, reservation_type || "other", reservation_reason || "", phone_number || "", equipment_needs || "", caretaker_name || ""]
        );

        await connect.commit();
        return result.affectedRows > 0 ? bookingStatus.success : bookingStatus.fail;
    } catch (err) {
        console.error(err);
        try { await connect.rollback(); } catch { /* connection already gone */ }
        return bookingStatus.fail;
    } finally {
        connect.end();
    }
}
