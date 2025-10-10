import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import getRoomsRepo from "../repositories/getRoomRepo";

export default async function getRoomControll(req:Request, res:Response){
  try {
    const tokenHeader = req.headers["authorization"] as string;
    const payload = verifyTokenService({tokenHeader});
    if(payload.role === "admin"){
      const rows = await getRoomsRepo();
      res.status(200).json({rows});
    } else {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการดูข้อมูล" });
    }
  } catch (err){
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}