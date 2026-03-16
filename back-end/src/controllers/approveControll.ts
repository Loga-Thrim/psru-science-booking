import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import adminApproveRepo from "../repositories/adminApproveRepo";
import approverApproveRepo from "../repositories/approverApproveRepo";

export default async function approveControll(req: Request, res: Response) {
    try {
        const { reservationId } = req.body;
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });

        if (!reservationId) {
            return res.status(400).json({ message: "reservationId is required" });
        }
        switch (payload.role) {
            case "admin": {
                const rows = await adminApproveRepo(reservationId);
                return res.status(200).json(rows);
            }
            case "approver": {
                const rows = await approverApproveRepo(reservationId);
                return res.status(200).json(rows);
            }
            default:
                return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}