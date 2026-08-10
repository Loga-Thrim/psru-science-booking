import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { reservationState } from "../enum/booking";
import type { TransitionResult } from "./adminApproveRepo";

export default async function approverApproveRepo(reservationId: string): Promise<TransitionResult> {
    const connect = await dbConnect();
    try {
        const [rows] = await connect.execute<RowDataPacket[]>(
            "SELECT reservation_status FROM reservations WHERE reservation_id = ?",
            [reservationId]
        );
        if (rows.length === 0) return "notFound";
        // The approver is the second stage: an admin must have signed off first.
        if (rows[0].reservation_status !== reservationState.adminApproved) return "wrongState";

        const [result] = await connect.execute<ResultSetHeader>(
            "UPDATE reservations SET reservation_status = ? WHERE reservation_id = ? AND reservation_status = ?",
            [reservationState.approverApproved, reservationId, reservationState.adminApproved]
        );
        return result.affectedRows > 0 ? "ok" : "wrongState";
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        connect.end();
    }
}
