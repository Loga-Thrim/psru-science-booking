import { Request, Response } from "express";
import dashboardRepo from "../repositories/dashboardRepo";

export default async function dashboardControll(req: Request, res: Response) {
  try {
    const stats = await dashboardRepo();
    return res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
}
