import { Request, Response } from "express";
import deleteUserService from "../services/deleteUserService";
import { deleteStatus } from "../enum/aut";
export default async function deleteUserControll(req: Request, res: Response) {
  try {
    const { status } = await deleteUserService(req.body);
    switch (status) {
      case deleteStatus.deleted:
        res.json({ message: "ลบบัญชีสำเร็จ" });
        break;

      case deleteStatus.canNotDelete:
        res.json({ message: "ลบบัญชีไม่สำเร็จ" });
        break;
    }
  } catch (err) {
    console.log(err);
    res.json({ message: "ลบบัญชีไม่สำเร็จ" });
  }
}
