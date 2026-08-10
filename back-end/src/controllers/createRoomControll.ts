import { Request, Response } from "express";
import createRoomService from "../services/createRoomService";
import { createRoomStatus } from "../enum/aut";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Returns an error message, or null when the payload is acceptable.
// Shared with updateRoomControll so both entry points enforce the same rules.
export function validateRoomPayload(body: any): string | null {
  if (!body || typeof body !== "object") return "ข้อมูลห้องไม่ถูกต้อง";

  if (typeof body.room_code !== "string" || body.room_code.trim().length === 0) {
    return "กรุณากรอกรหัสห้อง";
  }
  if (typeof body.room_type !== "string" || body.room_type.trim().length === 0) {
    return "กรุณาเลือกประเภทห้อง";
  }

  const capacity = Number(body.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) {
    return "ความจุห้องต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป";
  }

  if (body.room_status !== undefined && !["available", "unavailable"].includes(body.room_status)) {
    return "สถานะห้องต้องเป็น available หรือ unavailable";
  }

  const start = body.available_start_time;
  const end = body.available_end_time;
  if (start !== undefined && start !== "" && !TIME_RE.test(String(start))) {
    return "รูปแบบเวลาเปิดบริการไม่ถูกต้อง";
  }
  if (end !== undefined && end !== "" && !TIME_RE.test(String(end))) {
    return "รูปแบบเวลาปิดบริการไม่ถูกต้อง";
  }
  if (start && end && String(end) <= String(start)) {
    return "เวลาปิดบริการต้องอยู่หลังเวลาเปิดบริการ";
  }

  if (body.available_days !== undefined && body.available_days !== "") {
    const days = String(body.available_days).split(",").map((d) => d.trim().toLowerCase());
    if (!days.every((d) => DAY_KEYS.includes(d))) {
      return "วันที่เปิดให้จองไม่ถูกต้อง";
    }
  }

  if (body.advance_booking_days !== undefined && body.advance_booking_days !== "") {
    const advance = Number(body.advance_booking_days);
    if (!Number.isInteger(advance) || advance < 0) {
      return "จำนวนวันจองล่วงหน้าต้องเป็นจำนวนเต็มไม่ติดลบ";
    }
  }

  return null;
}

export default async function createRoomControll(req: Request, res: Response) {
  try {
    const invalid = validateRoomPayload(req.body);
    if (invalid) return res.status(400).json({ message: invalid });

    const { status, room_id } = await createRoomService(req.body);

    switch (status) {
      case createRoomStatus.created:
        return res.status(201).json({ message: "เพิ่มข้อมูลห้องสำเร็จ", room_id: room_id });

      case createRoomStatus.errorRoomCode:
        return res.status(409).json({ message: "มีห้องที่ใช้รหัสนี้แล้ว" });

      default:
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
