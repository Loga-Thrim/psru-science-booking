import { Request, Response } from "express";
import createRoomService from "../services/createRoomService";
import { createRoomStatus } from "../enum/aut";

export default async function createRoomControll(req: Request, res: Response) {
  try {
    const { status } = await createRoomService(req.body);

    switch (status) {
      case createRoomStatus.created:
        return res.status(201).json({ message: "เพิ่มข้อมูลห้องสำเร็จ" });

      case createRoomStatus.errorRoomCode:
        return res.status(409).json({ message: "มีห้องที่ใช้รหัสนี้แล้ว" });

      default:
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
