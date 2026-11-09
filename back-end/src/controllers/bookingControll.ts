import { Request, Response } from "express";
import bookingService from "../services/bookingService";
import optionalAuth from "../services/optionalAuth";
import { bookingStatus } from "../enum/booking";
import { BOOKING_FAILURES as FAILURES } from "./bookingFailures";
import { notifyNewBooking } from "../services/notifyService";
import { normalizeName, normalizePhone } from "../dto/guest";

export default async function bookingController(req: Request, res: Response) {
    try {
        const { room_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone_number, booker_name, equipment_needs, caretaker_name } = req.body ?? {};

        // Anyone may book; the name and phone are how the booking is found again.
        const name = normalizeName(booker_name);
        if (!name) {
            return res.status(400).json({ message: "กรุณากรอกชื่อ-นามสกุล" });
        }
        const phone = normalizePhone(phone_number);
        if (!phone) {
            return res.status(400).json({ message: "เบอร์โทรไม่ถูกต้อง กรุณากรอกเบอร์ 9-10 หลัก" });
        }

        const user_id = optionalAuth(req)?.user_id ?? null;

        const { status } = await bookingService({ room_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone_number: phone, booker_name: name, user_id, equipment_needs, caretaker_name });

        if (status === bookingStatus.success) {
            notifyNewBooking({ room_id, booker_name: name, date, start_time, end_time });
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
