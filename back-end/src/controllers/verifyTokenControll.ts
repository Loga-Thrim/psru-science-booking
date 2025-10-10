import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
export default function verifyTokenControll(req: Request, res: Response){
  const payload = verifyTokenService(req.body);
  console.log(payload)
  res.json({payload}).status(200)
}