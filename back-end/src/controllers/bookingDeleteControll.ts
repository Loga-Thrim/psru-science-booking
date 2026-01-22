import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import bookingDeleteRepo from "../repositories/bookingDeleteRepo";
export default async function bookingDeleteControll(req: Request, res: Response) {
    try {
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });
        const userId = payload.user_id;
        const reservationId = req.params.id as string;
        await bookingDeleteRepo(userId, reservationId);
        return res.status(200).json({message: "OK"});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }

}