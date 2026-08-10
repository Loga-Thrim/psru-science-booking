import { Request, Response } from "express";
import updateUserServcie from "../services/updateUserService";
import { updateStatus } from "../enum/aut";
import { isRole, isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH, ROLES } from "../dto/type";

export default async function updateUserControll(req: Request, res: Response) {
  try {
    const { user_id, email, username, department, role, password } = req.body ?? {};

    if (typeof user_id !== "string" || user_id.trim().length === 0) {
      return res.status(400).json({ message: "ไม่ได้ระบุผู้ใช้ที่ต้องการแก้ไข" });
    }
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
    // An empty password means "leave the current one alone".
    const newPassword = password === undefined || password === "" ? undefined : password;
    if (newPassword !== undefined && !isValidPassword(newPassword)) {
      return res.status(400).json({ message: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร` });
    }

    const { status } = await updateUserServcie({ user_id: user_id.trim(), email: email.trim(), username: username.trim(), department: department.trim(), role, password: newPassword });

    switch (status) {
      case updateStatus.updated:
        return res.status(200).json({ message: "แก้ไขข้อมูลสำเร็จ" });

      case updateStatus.notFound:
        return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" });

      case updateStatus.duplicateEmail:
        return res.status(409).json({ message: "อีเมลนี้ถูกใช้โดยบัญชีอื่นแล้ว" });

      case updateStatus.duplicateUserName:
        return res.status(409).json({ message: "ชื่อผู้ใช้นี้ถูกใช้โดยบัญชีอื่นแล้ว" });

      case updateStatus.canNotUpdate:
        return res.status(400).json({ message: "แก้ไขข้อมูลไม่สำเร็จ" });

      default:
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
