import { Request, Response } from "express";
import adminApproveRepo from "../repositories/adminApproveRepo";
import { notifyApproved } from "../services/notifyService";

export default async function approveControll(req: Request, res: Response) {
    try {
        const { reservationId } = req.body ?? {};

        if (typeof reservationId !== "string" || reservationId.trim().length === 0) {
            return res.status(400).json({ message: "ไม่ได้ระบุรายการจองที่ต้องการอนุมัติ" });
        }

        // checkAdmin on the route guarantees the caller is an admin.
        const result = await adminApproveRepo(reservationId);
        switch (result) {
            case "ok":
                notifyApproved(reservationId);
                return res.status(200).json({ message: "อนุมัติสำเร็จ" });
            case "notFound":
                return res.status(404).json({ message: "ไม่พบรายการจองนี้" });
            case "wrongState":
                return res.status(409).json({ message: "รายการนี้อนุมัติหรือถูกปฏิเสธไปแล้ว" });
            default:
                return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}
