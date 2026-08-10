import { Request, Response } from "express";
import rejectRepo from "../repositories/rejectRepo";

export default async function rejectControll(req: Request, res: Response) {
  try {
    const { reservationId, rejectionReason } = req.body ?? {};

    if (typeof reservationId !== "string" || reservationId.trim().length === 0) {
      return res.status(400).json({ message: "ไม่ได้ระบุรายการจองที่ต้องการปฏิเสธ" });
    }
    if (typeof rejectionReason !== "string" || rejectionReason.trim().length === 0) {
      return res.status(400).json({ message: "กรุณาระบุเหตุผลในการปฏิเสธ" });
    }

    const result = await rejectRepo(reservationId, rejectionReason.trim());
    switch (result) {
      case "ok":
        return res.status(200).json({ message: "ปฏิเสธรายการจองแล้ว" });
      case "notFound":
        return res.status(404).json({ message: "ไม่พบรายการจองนี้" });
      case "wrongState":
        return res.status(409).json({ message: "รายการนี้ผ่านการอนุมัติหรือถูกปฏิเสธไปแล้ว" });
      default:
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
