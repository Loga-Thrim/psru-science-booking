import { Request, Response } from "express";
import registerService from "../services/registerService";
import { registerStatus } from "../enum/aut";
import { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from "../dto/type";

export default async function registerController(req: Request, res: Response) {
  try {
    const { username, email, password, department } = req.body ?? {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
    }
    if (typeof username !== "string" || username.trim().length === 0) {
      return res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้" });
    }
    if (typeof department !== "string" || department.trim().length === 0) {
      return res.status(400).json({ message: "กรุณาเลือกคณะ/หน่วยงาน" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ message: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร` });
    }

    const {result} = await registerService({ username: username.trim(), email: email.trim(), password, department: department.trim() });

    switch (result) {
      case registerStatus.alreadyHaveAcount:
        return res.status(409).json({ message: "อีเมลนี้มีบัญชีผู้ใช้อยู่แล้ว" });

      case registerStatus.alreadyHaveUserName:
        return res.status(409).json({ message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });

      case registerStatus.notPass:
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });

      case registerStatus.pass:
        return res.status(201).json({ message: "OK" });

      default:
        return res.status(500).json({ message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
