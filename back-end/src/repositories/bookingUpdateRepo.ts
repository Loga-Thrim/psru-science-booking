import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { bookingStatus } from "../enum/booking";
import { checkBookingRules, normalizeBookingInput } from "./bookingRules";

/**
 * Reschedules a reservation the caller owns.
 *
 * Only a `pending` booking can be changed: once an approver has looked at it,
 * silently moving the date would invalidate their decision. Callers must
 * cancel and rebook instead.
 *
 * The room is never changed here — that is a different booking.
 */
export default async function bookingUpdateRepo(
  reservationId: string,
  userId: string,
  date: string,
  start_time: string,
  end_time: string,
  number_of_users: number,
  reservation_type: string,
  reservation_reason: string,
  phone_number: string,
  equipment_needs: string = "",
  caretaker_name: string = ""
) {
  if (!reservationId || typeof reservationId !== "string") {
    return bookingStatus.invalidInput;
  }

  const normalized = normalizeBookingInput(date, start_time, end_time, number_of_users);
  if (typeof normalized === "number") return normalized;
  const { start, end, attendees } = normalized;

  const connect = await dbConnect();
  try {
    await connect.beginTransaction();

    // Scope by user_id so one account cannot reschedule another's booking.
    const [rows] = await connect.execute<RowDataPacket[]>(
      "SELECT room_id, reservation_status FROM reservations WHERE reservation_id = ? AND user_id = ? FOR UPDATE",
      [reservationId, userId]
    );
    if (rows.length === 0) {
      await connect.rollback();
      return bookingStatus.notFound;
    }

    const existing = rows[0];
    if (existing.reservation_status !== "pending") {
      await connect.rollback();
      return bookingStatus.notEditable;
    }

    const violation = await checkBookingRules(connect, {
      room_id: String(existing.room_id),
      date,
      start,
      end,
      attendees,
      excludeReservationId: reservationId,
    });
    if (violation !== null) {
      await connect.rollback();
      return violation;
    }

    const [result] = await connect.execute<ResultSetHeader>(
      `UPDATE reservations SET
         booking_date = ?,
         start_time = ?,
         end_time = ?,
         number_of_users = ?,
         reservation_type = ?,
         reservation_reason = ?,
         phone = ?,
         equipment_needs = ?,
         caretaker_name = ?
       WHERE reservation_id = ? AND user_id = ? AND reservation_status = 'pending'`,
      [
        date,
        start,
        end,
        attendees,
        reservation_type || "other",
        reservation_reason || "",
        phone_number || "",
        equipment_needs || "",
        caretaker_name || "",
        reservationId,
        userId,
      ]
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
