import { Request, Response } from "express";
import deleteRoomService from "../services/deleteRoomService";
import { deleteStatus } from "../enum/aut";
export default async function deleteRoomControll(req:Request, res:Response){
  try {
      const room_id = req.params.id as string;
      const {status} = await deleteRoomService({room_id});
      switch(status) {
        case deleteStatus.deleted:
         return res.status(200).json({ message: "ลบข้อมูลห้องสำเร็จ" });

        case deleteStatus.canNotDelete:
         return res.status(400).json({ message: "ลบข้อมูลห้องไม่สำเร็จ" });

        default:
          return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
      }
  } catch (err){
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}