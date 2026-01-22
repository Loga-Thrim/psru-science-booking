import { Request, Response } from "express";
import uploadImageRepo from "../repositories/uploadImageRepo";

export default async function uploadImageControll(req: Request, res: Response) {
  try {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const [{filename,path}] = files;
  const room_id = req.params.room_id as string;
  const url = "http://localhost:3000/uploads/" + filename;
  await uploadImageRepo(room_id, path, url);
  return res.status(200);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}
