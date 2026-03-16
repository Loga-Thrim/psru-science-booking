import { Request, Response } from "express";
import getAllReservationsRepo from "../repositories/getAllReservationsRepo";
import verifyTokenService from "../services/verifyTokenService";
export default async function unapproveListControll(req: Request, res: Response) {
    try {
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });

        if (payload.role === "admin" || payload.role === "approver") {
            const rows = (await getAllReservationsRepo()) || [];
            return res.status(200).json(rows);
        }

        return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}
