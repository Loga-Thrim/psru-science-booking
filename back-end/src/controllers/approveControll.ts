import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import adminApproveRepo, { TransitionResult } from "../repositories/adminApproveRepo";
import approverApproveRepo from "../repositories/approverApproveRepo";
import { notifyAdminApproved, notifyApproved } from "../services/notifyService";

function respond(res: Response, result: TransitionResult, wrongStateMessage: string) {
    switch (result) {
        case "ok":
            return res.status(200).json({ message: "อนุมัติสำเร็จ" });
        case "notFound":
            return res.status(404).json({ message: "ไม่พบรายการจองนี้" });
        case "wrongState":
            return res.status(409).json({ message: wrongStateMessage });
        default:
            return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}

export default async function approveControll(req: Request, res: Response) {
    try {
        const { reservationId } = req.body ?? {};
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });

        if (typeof reservationId !== "string" || reservationId.trim().length === 0) {
            return res.status(400).json({ message: "ไม่ได้ระบุรายการจองที่ต้องการอนุมัติ" });
        }

        switch (payload.role) {
            case "admin": {
                const result = await adminApproveRepo(reservationId);
                if (result === "ok") notifyAdminApproved(reservationId);
                return respond(res, result, "รายการนี้ไม่ได้อยู่ในสถานะรอแอดมินอนุมัติ");
            }
            case "approver": {
                const result = await approverApproveRepo(reservationId);
                if (result === "ok") notifyApproved(reservationId);
                return respond(res, result, "รายการนี้ต้องผ่านการอนุมัติจากแอดมินก่อน");
            }
            default:
                return res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการอนุมัติ" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}
