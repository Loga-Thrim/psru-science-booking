import { Request, Response } from "express";
import updateUserServcie from "../services/updateUserService";
import { updateStatus } from "../enum/aut";
export default async function updateUserControll(req: Request, res: Response) {
  try {
      const { status } = await updateUserServcie(req.body);
      switch (status) {
        case updateStatus.updated:
          return res.status(200).json({ message: "แก้ไขข้อมูลสำเร็จ" });

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
