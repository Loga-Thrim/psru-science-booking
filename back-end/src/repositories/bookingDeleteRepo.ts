import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { reservationState } from "../enum/booking";

export type CancelResult = "ok" | "notFound" | "forbidden" | "alreadyApproved";

export default async function bookingDeleteRepo(userId: string, reservationId: string, isPrivileged: boolean): Promise<CancelResult> {
  const connect = await dbConnect();
  try {
    const [rows] = await connect.execute<RowDataPacket[]>(
      "SELECT user_id, reservation_status FROM reservations WHERE reservation_id = ?",
      [reservationId]
    );
    if (rows.length === 0) return "notFound";

    const reservation = rows[0];
    if (!isPrivileged && reservation.user_id !== userId) return "forbidden";

    // Matches what the UI offers: once fully approved the slot is committed and
    // has to be turned down by an approver rather than silently removed.
    if (!isPrivileged && reservation.reservation_status === reservationState.approverApproved) {
      return "alreadyApproved";
    }

    const [result] = await connect.execute<ResultSetHeader>(
      "DELETE FROM reservations WHERE reservation_id = ?",
      [reservationId]
    );
    return result.affectedRows > 0 ? "ok" : "notFound";
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    connect.end();
  }
}
