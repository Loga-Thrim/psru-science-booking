import { Request, Response } from "express";
import getUsersRepo from "../repositories/getUersRepo";
export default async function getUsersControll(_req: Request, res: Response) {
  try {
      const rows = await getUsersRepo();
      return res.status(200).json({ message: "OK", rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
