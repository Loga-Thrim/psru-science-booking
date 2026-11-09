import { Request, Response } from "express";
import optionalAuth from "../services/optionalAuth";
import roomScheduleRepo from "../repositories/roomScheduleRepo";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A month view needs ~42 days; anything much larger is not a real UI request. */
const MAX_SPAN_DAYS = 92;

export default async function roomScheduleControll(req: Request, res: Response) {
  try {
    const from = String(req.query.from ?? "");
    const to = String(req.query.to ?? "");
    const roomId = req.query.room_id ? String(req.query.room_id) : null;

    if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
      return res.status(400).json({ message: "ต้องระบุช่วงวันที่ในรูปแบบ YYYY-MM-DD" });
    }
    if (from > to) {
      return res.status(400).json({ message: "วันเริ่มต้นต้องไม่เกินวันสิ้นสุด" });
    }

    const span =
      (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000;
    if (span > MAX_SPAN_DAYS) {
      return res
        .status(400)
        .json({ message: `ช่วงวันที่ต้องไม่เกิน ${MAX_SPAN_DAYS} วัน` });
    }

    // Everyone sees who holds a slot (the booking form says "จองโดย ..."); the
    // booker's department and reason are left to the admin who acts on it.
    const rows = await roomScheduleRepo(from, to, roomId, optionalAuth(req) !== null);
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
