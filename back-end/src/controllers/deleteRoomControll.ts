import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import deleteRoomService from "../services/deleteRoomService";
import { deleteStatus } from "../enum/aut";
export default async function deleteRoomControll(req:Request, res:Response){
  try {
    const tokenHeader = req.headers["authorization"] as string;
    const payload = verifyTokenService({tokenHeader});
    if(payload.role === "admin"){
      const room_id = req.params.id as string;
      const {status} = await deleteRoomService({room_id});
      switch(status) {
        case deleteStatus.deleted:
          res.status(200).json({ message: "ลบข้อมูลห้องสำเร็จ" });
          break;

        case deleteStatus.canNotDelete:
          res.status(400).json({ message: "ลบข้อมูลห้องไม่สำเร็จ" });
          break;

        default:
          res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
      }
    } else {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการลบบ้อมูลห้อง" });
    }
  } catch (err){
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}