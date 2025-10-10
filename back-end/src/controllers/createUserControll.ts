import { Request, Response } from "express";
import createUserService from "../services/createUserService";
import { registerStatus } from "../enum/aut";
import verifyTokenService from "../services/verifyTokenService";

export default async function createUserControll(req: Request, res: Response) {
  try {
    const tokenHeader = req.headers["authorization"] as string;
    const payload = verifyTokenService({ tokenHeader });
    if (payload.role === "admin") {
      const { status } = await createUserService(req.body);

      switch (status) {
        case registerStatus.alreadyHaveAcount:
          res.status(409).json({ message: "อีเมลนี้มีบัญชีผู้ใช้อยู่แล้ว" });

        case registerStatus.alreadyHaveUserName:
          res.status(409).json({ message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });

        case registerStatus.notPass:
          res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });

        case registerStatus.pass:
          res.status(201).json({ message: "สร้างบัญชีผู้ใช้สำเร็จ" });

        default:
          res.status(500).json({ message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" });
      }
    } else {
          res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการสร้างบัญชี" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
