import { Request, Response } from "express";
import updateImageRepo from "../repositories/updateImageRepo";
export default async function updateImageControll(req: Request, res: Response) {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    const [{ filename, path }] = files;
    const room_id = req.params.id as string;
    const url = "http://localhost:3000/uploads/" + filename;
    await updateImageRepo(room_id, path, url);
    return res.status(200).json({ message: "แก้ไขข้อมูลห้องสำเร็จ" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
