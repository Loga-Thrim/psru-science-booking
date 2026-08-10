import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { reservationState } from "../enum/booking";

export type TransitionResult = "ok" | "notFound" | "wrongState";

export default async function adminApproveRepo(reservationId: string): Promise<TransitionResult> {
    const connect = await dbConnect();
    try {
        const [rows] = await connect.execute<RowDataPacket[]>(
            "SELECT reservation_status FROM reservations WHERE reservation_id = ?",
            [reservationId]
        );
        if (rows.length === 0) return "notFound";
        if (rows[0].reservation_status !== reservationState.pending) return "wrongState";

        const [result] = await connect.execute<ResultSetHeader>(
            "UPDATE reservations SET reservation_status = ? WHERE reservation_id = ? AND reservation_status = ?",
            [reservationState.adminApproved, reservationId, reservationState.pending]
        );
        // A concurrent request may have moved it first.
        return result.affectedRows > 0 ? "ok" : "wrongState";
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        connect.end();
    }
}
