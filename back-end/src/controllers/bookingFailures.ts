import { bookingStatus } from "../enum/booking";

/**
 * Each failure mode gets its own message so the user knows what to change.
 * Shared by the create and reschedule endpoints, which enforce the same rules.
 */
export const BOOKING_FAILURES: Record<number, { code: number; message: string }> = {
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
    [bookingStatus.notFound]:            { code: 404, message: "ไม่พบรายการจองนี้ หรือคุณไม่ใช่เจ้าของรายการ" },
    [bookingStatus.notEditable]:         { code: 409, message: "แก้ไขได้เฉพาะรายการที่ยังรอแอดมินตรวจสอบเท่านั้น" },
};
