import { Request, Response } from "express";
import uploadImageRepo from "../repositories/uploadImageRepo";

export default async function uploadImageControll(req: Request, res: Response) {
  try {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const [{path}] = files;
  const room_id = req.params.room_id;
  await uploadImageRepo(room_id, path);
  return res.status(200);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}
