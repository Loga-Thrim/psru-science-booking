import { Request, Response } from "express";
import getRoomsRepo from "../repositories/getRoomRepo";

export default async function getRoomControll(_req: Request, res: Response) {
  try {
    const rows = await getRoomsRepo();
    return res.status(200).json({ rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
