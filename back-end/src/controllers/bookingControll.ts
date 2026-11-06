import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import bookingService from "../services/bookingService";
import { bookingStatus } from "../enum/booking";
import { BOOKING_FAILURES as FAILURES } from "./bookingFailures";
import { notifyNewBooking } from "../services/notifyService";

export default async function bookingController(req: Request, res: Response) {
    try {
        const { room_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone_number, equipment_needs, caretaker_name } = req.body ?? {};
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });
        const user_id = payload.user_id;

        const { status } = await bookingService({ room_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone_number, user_id, equipment_needs, caretaker_name });

        if (status === bookingStatus.success) {
            notifyNewBooking({ room_id, user_id, date, start_time, end_time });
            return res.status(201).json({ message: "จองห้องสำเร็จ" });
        }

        const failure = FAILURES[status];
        if (failure) {
            return res.status(failure.code).json({ message: failure.message });
        }
        return res.status(500).json({ message: "จองห้องไม่สำเร็จ" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}
