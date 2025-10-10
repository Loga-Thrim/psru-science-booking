import { Request, Response } from "express";
import updateUserServcie from "../services/updateUserService";
import { updateStatus } from "../enum/aut";
export default async function updateUserControll(req: Request, res: Response ){
  try {
    const {status} = await updateUserServcie(req.body);
    switch(status){
      case updateStatus.updated:
        res.json({"message":"แก้ไขข้อมูลสำเร็จ"})
        break;

      case updateStatus.canNotUpdate:
        res.json({"message":"แก้ไขข้อมูลไม่สำเร็จ"})
        break;
    }
    console.log(req.body);
  } catch (err){
    console.log(err);
  }
}