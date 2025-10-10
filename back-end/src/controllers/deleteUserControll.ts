import { Request, Response } from "express";
import deleteUserService from "../services/deleteUserService";
import { deleteStatus } from "../enum/aut";
import verifyTokenService from "../services/verifyTokenService";
export default async function deleteUserControll(req: Request, res: Response) {
  try {
    const tokenHeader = req.headers["authorization"] as string;
    const payload = verifyTokenService({ tokenHeader });
    if (payload.role === "admin") {
      const { status } = await deleteUserService(req.body);
      switch (status) {
        case deleteStatus.deleted:
          res.status(200).json({ message: "ลบบัญชีสำเร็จ" });
          break;

        case deleteStatus.canNotDelete:
          res.status(400).json({ message: "ลบบัญชีไม่สำเร็จ" });
          break;

        default:
          res.status(500).json({ message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" });
      }
    } else {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการลบบัญชี" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" });
  }
}
