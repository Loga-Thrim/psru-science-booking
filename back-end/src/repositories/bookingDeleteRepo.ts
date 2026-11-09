import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { reservationState } from "../enum/booking";

export type CancelResult = "ok" | "notFound" | "pastOrClosed";

/** Who is cancelling: a signed-in admin, or a guest proving ownership by phone. */
export type Canceller = { admin: true } | { admin: false; phone: string };

export default async function bookingDeleteRepo(reservationId: string, who: Canceller): Promise<CancelResult> {
  const connect = await dbConnect();
  try {
    const [rows] = await connect.execute<RowDataPacket[]>(
      "SELECT phone, reservation_status, booking_date < CURDATE() AS is_past FROM reservations WHERE reservation_id = ?",
      [reservationId]
    );
    if (rows.length === 0) return "notFound";

    const reservation = rows[0];
    if (!who.admin) {
      // The phone number given at booking is the only proof of ownership.
      // Report a mismatch as not found, so the endpoint can't be used to probe
      // which booking IDs exist.
      if (reservation.phone !== who.phone) return "notFound";
      // Past bookings are history, and rejected ones never held the room.
      if (reservation.is_past || reservation.reservation_status === reservationState.rejected) {
        return "pastOrClosed";
      }
    }

    const [result] = await connect.execute<ResultSetHeader>(
      "DELETE FROM reservations WHERE reservation_id = ?",
      [reservationId]
    );
    return result.affectedRows > 0 ? "ok" : "notFound";
  } finally {
    connect.end();
  }
}
