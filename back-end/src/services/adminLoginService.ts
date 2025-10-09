import { adminLoginRequest, adminLoginResponse } from "../dto/aut";
import adminLoginRepo from "../repositories/adminLoginRepo";
import jwt from "jsonwebtoken"
export default async function adminLoginService(body:adminLoginRequest):Promise<adminLoginResponse>{
  const {email, password} = body;
  const result  = await adminLoginRepo(email, password);
  if(result){
    const token = jwt.sign({ email, password }, String(process.env.JWT_KEY), { expiresIn: '1d' })
    return {token:token};
  } else {
    return {token:""};
  }
}