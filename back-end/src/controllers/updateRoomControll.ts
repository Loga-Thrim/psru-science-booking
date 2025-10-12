import { Request, Response } from "express";
import updateRoomService from "../services/updateRoomService";
import { updateStatus } from "../enum/aut";
export default async function  updateRoomControll(req:Request, res:Response){
    try {
      const id = req.params.id as string;
      const room = req.body;
      const {status} = await updateRoomService({id ,room});
      switch(status) {
        case updateStatus.updated:
          return res.status(200).json({ message: "แก้ไขข้อมูลห้องสำเร็จ" });

        default:
          return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
      }
  } catch (err){
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}