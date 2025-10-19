import { Request, Response } from "express";
import getBookRoomsRepo from "../repositories/getBookRoomsRepo";
export default async function getBookRoomsControll(_req:Request, res: Response){
  try{
    const rows = await getBookRoomsRepo();
    console.log(rows);
    return res.status(200).json(rows);
  }catch (err){
    console.log(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}