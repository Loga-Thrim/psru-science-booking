import { Request, Response } from "express";
import createUserService from "../services/createUserService";
import { registerStatus } from "../enum/aut";

export default async function createUserControll(req: Request, res: Response) {
  try {
    const { status } = await createUserService(req.body);

    switch (status) {
      case registerStatus.alreadyHaveAcount:
        return res.status(409).json({ message: "อีเมลนี้มีบัญชีผู้ใช้อยู่แล้ว" });

      case registerStatus.alreadyHaveUserName:
        return res.status(409).json({ message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });

      case registerStatus.notPass:
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });

      case registerStatus.pass:
        return res.status(201).json({ message: "สร้างบัญชีผู้ใช้สำเร็จ" });

      default:
        return res.status(500).json({ message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
