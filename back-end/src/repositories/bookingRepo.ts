import dbConnect from "../configs/dbConnect";
import { ResultSetHeader } from "mysql2";
import { bookingStatus } from "../enum/booking";
import { checkBookingRules, normalizeBookingInput } from "./bookingRules";

export default async function bookingRepo(room_id: string, date: string, start_time: string, end_time: string, number_of_users: number, reservation_type: string, reservation_reason: string, phone_number: string, user_id: string, equipment_needs: string = "", caretaker_name: string = "") {
    if (!room_id || typeof room_id !== "string") return bookingStatus.invalidInput;

    const normalized = normalizeBookingInput(date, start_time, end_time, number_of_users);
    if (typeof normalized === "number") return normalized;
    const { start, end, attendees } = normalized;

    const connect = await dbConnect();
    try {
        await connect.beginTransaction();

        const violation = await checkBookingRules(connect, {
            room_id,
            date,
            start,
            end,
            attendees,
        });
        if (violation !== null) {
            await connect.rollback();
            return violation;
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
