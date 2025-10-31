import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import bookingListRepo from "../repositories/bookingListRepo";
export default async function bookingListControll(req: Request, res: Response) {
    try {
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });
        const id = payload.user_id;
        const rows = await bookingListRepo(id);
        return res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }

}