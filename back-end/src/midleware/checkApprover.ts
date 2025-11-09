
import { Request, Response, NextFunction } from "express";
import verifyTokenService from "../services/verifyTokenService";

export default async function checkApprover(req: Request, res: Response, next: NextFunction) {
  try {
    const tokenHeader = req.headers["authorization"] as string;
    if (!tokenHeader) {
      return res.status(401).json({ message: "ไม่ได้ส่งโทเค็นมาในคำขอ" });
    }
    const payload = verifyTokenService({ tokenHeader });
    if (payload.role === "admin" || payload.role === "approver") {
      return next();
    } else {
        return res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการอนุมัติ" });
    }
  } catch (err: any) {
    console.error(err);
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "โทเค็นไม่ถูกต้องหรือหมดอายุ" });
    }
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
