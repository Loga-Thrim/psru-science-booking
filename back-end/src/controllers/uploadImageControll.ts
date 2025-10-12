import { Request, Response } from "express";

export default function uploadImageControll(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[]) ?? [];
  console.log(files);
  return res.status(201).json({ count: files.length }); // ส่งครั้งเดียว แล้วจบ
}
