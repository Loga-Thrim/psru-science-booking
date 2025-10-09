import loginRepo from "../repositories/loginRepo";
import { loginRequest, loginResponse } from "../dto/aut";
import { loginStatus } from "../enum/aut";

export default async function loginService(body:loginRequest):Promise<loginResponse> {
  try{
    const {email, password} = body;
    const result = await loginRepo(email, password);
    return result;
  }catch (error){
    console.log(error);
    const result = loginStatus.notPass;
    return {result, rows:[]};
  }
}