import { Request, Response } from "express";
import createUserService from "../services/createUserService";
import { registerStatus } from "../enum/aut";
import { isRole, isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH, ROLES } from "../dto/type";

export default async function createUserControll(req: Request, res: Response) {
  try {
    const { email, username, department, role, password } = req.body ?? {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
    }
    if (typeof username !== "string" || username.trim().length === 0) {
      return res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้" });
    }
    if (typeof department !== "string" || department.trim().length === 0) {
      return res.status(400).json({ message: "กรุณาเลือกคณะ/หน่วยงาน" });
    }
    if (!isRole(role)) {
      return res.status(400).json({ message: `สิทธิ์ผู้ใช้ต้องเป็นหนึ่งใน: ${ROLES.join(", ")}` });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ message: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร` });
    }

    const { status } = await createUserService({ email: email.trim(), username: username.trim(), department: department.trim(), role, password });

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
