import { Request, Response } from "express";
import updateUserServcie from "../services/updateUserService";
import { updateStatus } from "../enum/aut";
import verifyTokenService from "../services/verifyTokenService";
export default async function updateUserControll(req: Request, res: Response) {
  try {
    const tokenHeader = req.headers["authorization"] as string;
    const payload = verifyTokenService({ tokenHeader });
    if (payload.role === "admin") {
      const { status } = await updateUserServcie(req.body);
      switch (status) {
        case updateStatus.updated:
          res.status(200).json({ message: "แก้ไขข้อมูลสำเร็จ" });

        case updateStatus.canNotUpdate:
          res.status(400).json({ message: "แก้ไขข้อมูลไม่สำเร็จ" });

        default:
          res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
      }
    }else {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการสร้างบัญชี" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
