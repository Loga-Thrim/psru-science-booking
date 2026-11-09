import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";

export interface ConflictCheck {
  hasConflict: boolean;
  conflictingBookings: RowDataPacket[];
}

/**
 * Bookings that overlap a time range in one room, pending ones included: a
 * request waiting for approval still holds its slot.
 *
 * This endpoint is public, so it returns only what the booking form shows —
 * the times, the status and the booker's name — never phone numbers or notes.
 */
export default async function checkBookingConflictRepo(
  room_id: string,
  booking_date: string,
  start_time: string,
  end_time: string,
  exclude_reservation_id?: string
): Promise<ConflictCheck> {
  const connect = await dbConnect();
  try {
    let query = `
      SELECT res.reservation_id, res.start_time, res.end_time, res.reservation_status,
             COALESCE(res.booker_name, u.username) AS username
      FROM reservations res
      LEFT JOIN users u ON res.user_id = u.user_id
      WHERE res.room_id = ?
      AND res.booking_date = ?
      AND res.reservation_status != 'rejected'
      AND res.start_time < ? AND res.end_time > ?
    `;
    const params: unknown[] = [room_id, booking_date, end_time, start_time];

    if (exclude_reservation_id) {
      query += " AND res.reservation_id != ?";
      params.push(exclude_reservation_id);
    }
    query += " ORDER BY res.start_time";

    const [result] = await connect.execute<RowDataPacket[]>(query, params);

    return {
      hasConflict: result.length > 0,
      conflictingBookings: result,
    };
  } finally {
    connect.end();
  }
}
