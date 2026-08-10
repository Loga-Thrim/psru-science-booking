import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";

export default function verifyTokenControll(req: Request, res: Response) {
  try {
    const tokenHeader = req.headers["authorization"] as string;
    const payload = verifyTokenService({ tokenHeader });
    return res.status(200).json({ payload });
  } catch (err: any) {
    // An invalid or expired token is a client problem, not a server fault.
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "โทเค็นไม่ถูกต้องหรือหมดอายุ" });
    }
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
