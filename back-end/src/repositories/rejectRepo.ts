import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { reservationState } from "../enum/booking";
import type { TransitionResult } from "./adminApproveRepo";

// A booking can only be turned down while it is still moving through approval.
const REJECTABLE: string[] = [reservationState.pending, reservationState.adminApproved];

export default async function rejectRepo(reservationId: string, rejectionReason: string): Promise<TransitionResult> {
  const connect = await dbConnect();
  try {
    const [rows] = await connect.execute<RowDataPacket[]>(
      "SELECT reservation_status FROM reservations WHERE reservation_id = ?",
      [reservationId]
    );
    if (rows.length === 0) return "notFound";
    if (!REJECTABLE.includes(rows[0].reservation_status)) return "wrongState";

    const [result] = await connect.execute<ResultSetHeader>(
      `UPDATE reservations SET reservation_status = ?, rejection_reason = ?
       WHERE reservation_id = ? AND reservation_status IN (?, ?)`,
      [reservationState.rejected, rejectionReason, reservationId, reservationState.pending, reservationState.adminApproved]
    );
    return result.affectedRows > 0 ? "ok" : "wrongState";
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    connect.end();
  }
}
