import { Request, Response } from "express";
import jwt from "jsonwebtoken"
export default function verifyTokenControll(req: Request, res: Response){
  const token = req.body.token;
  const payload = jwt.verify(token,process.env.JWT_KEY as string);
  console.log(payload);
  res.json({payload}).status(200)
}