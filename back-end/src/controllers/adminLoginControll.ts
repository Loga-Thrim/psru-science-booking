import {Request, Response} from "express"
import adminLoginService from "../services/adminLoginService";
export default async function adminLoginControll(req:Request, res: Response):Promise<void>{
  const {token} = await adminLoginService(req.body);
  res.json({"token":token}).status(200);
}