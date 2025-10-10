import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import createRoomService from "../services/createRoomService";
import {createRoomStatus} from "../enum/aut"

export default async function createRoomControll(req:Request, res:Response){
  try {
    const tokenHeader = req.headers["authorization"] as string;
    const payload = verifyTokenService({tokenHeader});
    if(payload.role === "admin"){
      const {status} = await createRoomService(req.body)
      switch(status) {
        case createRoomStatus.created:
          res.status(200).json({ message: "เพิ่มข้อมูลห้องสำเร็จ" });

        case createRoomStatus.errorRoomCode:
          res.status(200).json({ message: "มีห้องที่ใช้รหัสนี้แล้ว" });

        default:
          res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
      }
    } else {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการเพิ่มข้อมูลห้อง" });
    }
  } catch (err){
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}