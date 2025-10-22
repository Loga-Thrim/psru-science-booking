import { Request, Response } from "express";
import getNewBookingRoomRepo from "../repositories/getNewBookingRoom";
export default async function getNewBookingRoomControll(req:Request, res: Response){
  try {
    const id = req.params.id;
    const rows = await getNewBookingRoomRepo(id);
    return res.status(200).json(rows);
  } catch (err){
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}