import { Request, Response } from "express";
import updateImageRepo from "../repositories/updateImageRepo";

export default async function updateImageControll(req: Request, res: Response) {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length === 0) {
      return res.status(400).json({ message: "ไม่พบไฟล์รูปภาพในคำขอ" });
    }

    const { filename, path } = files[0];
    const room_id = req.params.id as string;
    const url = "/uploads/" + filename;
    await updateImageRepo(room_id, path, url);
    return res.status(200).json({ message: "แก้ไขรูปภาพห้องสำเร็จ", image: url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
