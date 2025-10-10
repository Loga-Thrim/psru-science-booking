import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import getUsersRepo from "../repositories/getUersRepo";
export default async function getUsersControll(req: Request, res: Response){
  const payload = verifyTokenService(req.body);
  const {role} = payload;
  if(role == "admin"){
   const rows = await getUsersRepo()
   res.json({"message":"OK",rows}).status(200);
  } else {
    res.json({message: "You not have permitsion"});
  }
}