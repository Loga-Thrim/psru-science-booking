import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import getUsersRepo from "../repositories/getUersRepo";
export default async function getUsersControll(req: Request, res: Response) {
  try {
    const tokenHeader = req.headers["authorization"] as string;
    const payload = verifyTokenService({ tokenHeader });
    if (payload.role === "admin") {
      const rows = await getUsersRepo();
      res.status(200).json({ message: "OK", rows });
    } else {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการสร้างบัญชี" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });

  }
}
