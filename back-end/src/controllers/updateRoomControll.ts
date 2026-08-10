import { Request, Response } from "express";
import updateRoomService from "../services/updateRoomService";
import { updateStatus } from "../enum/aut";
import { validateRoomPayload } from "./createRoomControll";

export default async function updateRoomControll(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const invalid = validateRoomPayload(req.body);
    if (invalid) return res.status(400).json({ message: invalid });

    const { status } = await updateRoomService({ id, room: req.body });
    switch (status) {
      case updateStatus.updated:
        return res.status(200).json({ message: "แก้ไขข้อมูลห้องสำเร็จ" });

      case updateStatus.notFound:
        return res.status(404).json({ message: "ไม่พบห้องที่ต้องการแก้ไข" });

      case updateStatus.duplicateRoomCode:
        return res.status(409).json({ message: "มีห้องที่ใช้รหัสนี้แล้ว" });

      default:
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
