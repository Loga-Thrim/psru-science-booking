import type { Connection } from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import { bookingStatus } from "../enum/booking";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Accepts "HH:MM" or "HH:MM:SS" and always returns "HH:MM:SS". */
export function normalizeTime(value: string): string | null {
  if (typeof value !== "string" || !TIME_RE.test(value.trim())) return null;
  const [h, m, s] = value.trim().split(":");
  return `${h}:${m}:${s ?? "00"}`;
}

export function daysBetween(from: string, to: string): number {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10));
  return Math.round((b - a) / 86400000);
}

export interface NormalizedBooking {
  date: string;
  start: string;
  end: string;
  attendees: number;
}

/**
 * Shape-checks the request before any database work.
 * Returns the cleaned values, or the status explaining what was wrong.
 */
export function normalizeBookingInput(
  date: unknown,
  start_time: unknown,
  end_time: unknown,
  number_of_users: unknown
): NormalizedBooking | bookingStatus {
  if (typeof date !== "string" || !DATE_RE.test(date)) return bookingStatus.invalidInput;

  const start = normalizeTime(start_time as string);
  const end = normalizeTime(end_time as string);
  if (!start || !end) return bookingStatus.invalidInput;

  const attendees = Number(number_of_users);
  if (!Number.isInteger(attendees) || attendees < 1) return bookingStatus.invalidInput;

  if (end <= start) return bookingStatus.invalidTimeRange;

  return { date, start, end, attendees };
}

/**
 * Every rule a reservation must satisfy, checked against a locked room row.
 *
 * Creating and rescheduling share this so the two paths can never drift apart.
 * Must be called inside a transaction; the caller decides commit or rollback.
 *
 * @param excludeReservationId row to ignore in the clash check, so a booking
 *        being rescheduled does not collide with its own current times.
 * @returns null when the booking is allowed, otherwise the reason.
 */
export async function checkBookingRules(
  connect: Connection,
  params: {
    room_id: string;
    date: string;
    start: string;
    end: string;
    attendees: number;
    excludeReservationId?: string;
  }
): Promise<bookingStatus | null> {
  const { room_id, date, start, end, attendees, excludeReservationId } = params;

  // Lock the room row so two concurrent bookings for it are serialized.
  const [roomRows] = await connect.execute<RowDataPacket[]>(
    "SELECT room_id, capacity, status, available_start_time, available_end_time, available_days, advance_booking_days FROM rooms WHERE room_id = ? FOR UPDATE",
    [room_id]
  );
  if (roomRows.length === 0) return bookingStatus.roomNotFound;
  const room = roomRows[0];

  if (room.status && String(room.status).toLowerCase() !== "available") {
    return bookingStatus.roomUnavailable;
  }

  const [[{ today }]] = (await connect.query<RowDataPacket[]>(
    "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today"
  )) as unknown as [RowDataPacket[], unknown];

  const offset = daysBetween(today, date);
  if (offset < 0) return bookingStatus.pastDate;

  const advance = Number(room.advance_booking_days);
  if (Number.isFinite(advance) && advance > 0 && offset > advance) {
    return bookingStatus.tooFarAhead;
  }

  const allowedDays = String(room.available_days || "mon,tue,wed,thu,fri")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  const dayKey = DAY_KEYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  if (allowedDays.length > 0 && !allowedDays.includes(dayKey)) {
    return bookingStatus.dayNotAllowed;
  }

  const openAt = normalizeTime(String(room.available_start_time || "08:00:00"));
  const closeAt = normalizeTime(String(room.available_end_time || "17:00:00"));
  if (openAt && closeAt && (start < openAt || end > closeAt)) {
    return bookingStatus.outsideOpeningHours;
  }

  if (Number.isFinite(Number(room.capacity)) && attendees > Number(room.capacity)) {
    return bookingStatus.overCapacity;
  }

  // Two ranges overlap when each starts before the other ends.
  // Touching ranges (09:00-11:00 and 11:00-12:00) do not overlap.
  let sql = `SELECT reservation_id FROM reservations
             WHERE room_id = ?
               AND booking_date = ?
               AND reservation_status <> 'rejected'
               AND start_time < ?
               AND end_time > ?`;
  const args: unknown[] = [room_id, date, end, start];
  if (excludeReservationId) {
    sql += " AND reservation_id <> ?";
    args.push(excludeReservationId);
  }
  sql += " LIMIT 1";

  const [clash] = await connect.execute<RowDataPacket[]>(sql, args);
  if (clash.length > 0) return bookingStatus.conflict;

  return null;
}
