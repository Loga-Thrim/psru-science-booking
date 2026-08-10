import { Request, Response } from "express";
import uploadImageRepo from "../repositories/uploadImageRepo";

export default async function uploadImageControll(req: Request, res: Response) {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length === 0) {
      return res.status(400).json({ message: "ไม่พบไฟล์รูปภาพในคำขอ" });
    }

    const room_id = req.params.room_id as string;
    const saved = [];
    for (const file of files) {
      const url = "/uploads/" + file.filename;
      await uploadImageRepo(room_id, file.path, url);
      saved.push(url);
    }

    return res.status(201).json({ message: "อัปโหลดรูปภาพสำเร็จ", images: saved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
