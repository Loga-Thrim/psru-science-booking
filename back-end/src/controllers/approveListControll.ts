import { Request, Response } from "express";
import getUnapproveListRepo from "../repositories/getUnapproveListRepo";
import getAdminApprovedListRepo from "../repositories/getAdminApprovedListRepo";
import verifyTokenService from "../services/verifyTokenService";
export default async function unapproveListControll(req: Request, res: Response) {
    try {
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });
        
        // Both admin and approver see the same list (pending + adminApproved)
        if (payload.role === "admin" || payload.role === "approver") {
            const pendingRows = await getUnapproveListRepo() || [];
            const adminApprovedRows = await getAdminApprovedListRepo() || [];
            const allRows = [...pendingRows, ...adminApprovedRows];
            return res.status(200).json(allRows);
        }
        
        return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}
