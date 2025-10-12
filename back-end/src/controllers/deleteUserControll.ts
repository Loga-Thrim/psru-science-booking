import { Request, Response } from "express";
import deleteUserService from "../services/deleteUserService";
import { deleteStatus } from "../enum/aut";
export default async function deleteUserControll(req: Request, res: Response) {
  try {
    const { status } = await deleteUserService(req.body);
    switch (status) {
      case deleteStatus.deleted:
        return res.status(200).json({ message: "ลบบัญชีสำเร็จ" });

      case deleteStatus.canNotDelete:
        return res.status(400).json({ message: "ลบบัญชีไม่สำเร็จ" });

      default:
        return res.status(500).json({ message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" });
  }
}
