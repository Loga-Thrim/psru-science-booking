import dbConnect from "../configs/dbConnect";
import { ResultSetHeader } from "mysql2";
import { bookingStatus } from "../enum/booking";

export default async function bookingRepo(room_id: string, date: string, start_time: string, end_time: string, number_of_users: number, reservation_type: string, reservation_reason: string, phone_number: string, user_id: string) {
    try {
        const connect = await dbConnect();
        const [result] = await connect.execute<ResultSetHeader>(`
        INSERT INTO reservations
            (room_id, user_id, booking_date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [room_id, user_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason || "", phone_number]
        );

        if (result.affectedRows && result.affectedRows > 0) {
            return bookingStatus.success;
        } else {
            return bookingStatus.fail;
        }
    } catch (err) {
        console.error(err);
        return bookingStatus.fail;
    }
}
