import { bookingStatus } from './../enum/booking';
import { bookingRequest, bookingResponse } from "../dto/booking";
import bookingRepo from '../repositories/bookingRepo';
export default async function bookingService(body: bookingRequest): Promise<bookingResponse> {
    try {
        const { room_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone_number, user_id, equipment_needs, caretaker_name } = body;
        const status = await bookingRepo(room_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone_number, user_id, equipment_needs, caretaker_name);
        return { status };
    } catch (err) {
        console.error(err);
        return { status: bookingStatus.fail };
    }
}
