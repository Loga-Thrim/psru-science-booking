import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
export default function verifyTokenControll(req: Request, res: Response){
  const tokenHeader = req.headers["authorization"] as string;
  const payload = verifyTokenService({tokenHeader});
  return res.json({payload}).status(200);
}