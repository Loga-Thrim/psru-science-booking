import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import updateRoomService from "../services/updateRoomService";
import { updateStatus } from "../enum/aut";
export default async function  updateRoomControll(req:Request, res:Response){
    try {
    const tokenHeader = req.headers["authorization"] as string;
    const payload = verifyTokenService({tokenHeader});
    if(payload.role === "admin"){
      const id = req.params.id as string;
      console.log(id);
      const room = req.body;
      const {status} = await updateRoomService({id ,room});
      switch(status) {
        case updateStatus.updated:
          res.status(200).json({ message: "แก้ไขข้อมูลห้องสำเร็จ" });

        default:
          res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
      }
    } else {
      res.status(403).json({ message: "คุณไม่มีสิทธิ์ในการแก้ไขข้อมูล" });
    }
  } catch (err){
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}