import { Request, Response } from "express";
import optionalAuth from "../services/optionalAuth";
import bookingDeleteRepo, { Canceller } from "../repositories/bookingDeleteRepo";
import { normalizePhone } from "../dto/guest";

export default async function bookingDeleteControll(req: Request, res: Response) {
    try {
        const reservationId = req.params.id as string;
        if (!reservationId) {
            return res.status(400).json({ message: "ไม่ได้ระบุรายการจองที่ต้องการยกเลิก" });
        }

        let who: Canceller;
        if (optionalAuth(req)) {
            who = { admin: true };
        } else {
            const phone = normalizePhone(req.body?.phone);
            if (!phone) {
                return res.status(400).json({ message: "กรุณาระบุเบอร์โทรที่ใช้จอง" });
            }
            who = { admin: false, phone };
        }

        const result = await bookingDeleteRepo(reservationId, who);
        switch (result) {
            case "ok":
                return res.status(200).json({ message: "ยกเลิกการจองแล้ว" });
            case "notFound":
                return res.status(404).json({ message: "ไม่พบรายการจองนี้" });
            case "pastOrClosed":
                return res.status(409).json({ message: "รายการนี้ผ่านไปแล้วหรือไม่ได้รับอนุมัติ จึงยกเลิกไม่ได้" });
            default:
                return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}
