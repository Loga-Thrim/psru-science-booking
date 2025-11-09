import { Request, Response } from "express";
import getUnapproveListRepo from "../repositories/getUnapproveListRepo";
import getAdminApprovedListRepo from "../repositories/getAdminApprovedListRepo";
import verifyTokenService from "../services/verifyTokenService";
export default async function unapproveListControll(req: Request, res: Response) {
    try {
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });
        switch (payload.role) {
            case "admin": {
                const rows = await getUnapproveListRepo();
                console.log(rows);
                return res.status(200).json(rows);
            }
            case "approver": {
                const rows = await getAdminApprovedListRepo();
                console.log(rows);
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
