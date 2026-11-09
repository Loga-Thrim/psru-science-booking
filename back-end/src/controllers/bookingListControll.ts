import { Request, Response } from "express";
import bookingListRepo from "../repositories/bookingListRepo";
import { normalizePhone } from "../dto/guest";

export default async function bookingListControll(req: Request, res: Response) {
    try {
        const phone = normalizePhone(req.query.phone);
        if (!phone) {
            return res.status(400).json({ message: "กรุณากรอกเบอร์โทร 9-10 หลัก" });
        }
        const rows = await bookingListRepo(phone);
        return res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}
