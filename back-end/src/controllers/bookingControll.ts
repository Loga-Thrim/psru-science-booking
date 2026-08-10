import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import bookingService from "../services/bookingService";
import { bookingStatus } from "../enum/booking";

// Each failure mode gets its own message so the user knows what to change.
const FAILURES: Record<number, { code: number; message: string }> = {
    [bookingStatus.invalidInput]:        { code: 400, message: "ข้อมูลการจองไม่ถูกต้องหรือกรอกไม่ครบ" },
    [bookingStatus.invalidTimeRange]:    { code: 400, message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น" },
    [bookingStatus.pastDate]:            { code: 400, message: "ไม่สามารถจองย้อนหลังได้" },
    [bookingStatus.tooFarAhead]:         { code: 400, message: "เกินระยะเวลาที่จองล่วงหน้าได้ของห้องนี้" },
    [bookingStatus.dayNotAllowed]:       { code: 400, message: "ห้องนี้ไม่เปิดให้จองในวันที่เลือก" },
    [bookingStatus.outsideOpeningHours]: { code: 400, message: "ช่วงเวลาที่เลือกอยู่นอกเวลาเปิดให้บริการของห้อง" },
    [bookingStatus.overCapacity]:        { code: 400, message: "จำนวนผู้เข้าใช้เกินความจุของห้อง" },
    [bookingStatus.roomUnavailable]:     { code: 409, message: "ห้องนี้ยังไม่เปิดให้จองในขณะนี้" },
    [bookingStatus.conflict]:            { code: 409, message: "ช่วงเวลานี้ถูกจองไปแล้ว กรุณาเลือกช่วงเวลาอื่น" },
    [bookingStatus.roomNotFound]:        { code: 404, message: "ไม่พบห้องที่ต้องการจอง" },
};

export default async function bookingController(req: Request, res: Response) {
    try {
        const { room_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone_number, equipment_needs, caretaker_name } = req.body ?? {};
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });
        const user_id = payload.user_id;

        const { status } = await bookingService({ room_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone_number, user_id, equipment_needs, caretaker_name });

        if (status === bookingStatus.success) {
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
