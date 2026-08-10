import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import bookingDeleteRepo from "../repositories/bookingDeleteRepo";

export default async function bookingDeleteControll(req: Request, res: Response) {
    try {
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });
        const reservationId = req.params.id as string;

        if (!reservationId) {
            return res.status(400).json({ message: "ไม่ได้ระบุรายการจองที่ต้องการยกเลิก" });
        }

        const isPrivileged = payload.role === "admin";
        const result = await bookingDeleteRepo(payload.user_id, reservationId, isPrivileged);

        switch (result) {
            case "ok":
                return res.status(200).json({ message: "ยกเลิกการจองแล้ว" });
            case "notFound":
                return res.status(404).json({ message: "ไม่พบรายการจองนี้" });
            case "forbidden":
                return res.status(403).json({ message: "คุณไม่มีสิทธิ์ยกเลิกการจองของผู้อื่น" });
            case "alreadyApproved":
                return res.status(409).json({ message: "การจองนี้ได้รับการอนุมัติแล้ว กรุณาติดต่อผู้อนุมัติเพื่อยกเลิก" });
            default:
                return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}
