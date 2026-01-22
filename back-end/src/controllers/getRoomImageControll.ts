import { Request, Response } from "express";
import getRoomsImageRepo from "../repositories/getRoomImageRepo";
export default async function (req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const rows = await getRoomsImageRepo(id);
    if(rows == undefined){
      return res.status(200).json({ message: "ไม่พบรูปภาพ" });
    }
    return res.status(200).json(rows);
  } catch (err){
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}