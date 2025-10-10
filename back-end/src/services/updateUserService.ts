import { updateUserRequest, updateUserResponse } from "../dto/aut";
import { updateStatus } from "../enum/aut";
import updateUsersRepo from "../repositories/updateUserRepo";
import verifyTokenService from "./verifyTokenService";
export default async function updateUserServcie(body:updateUserRequest): Promise<updateUserResponse>{
  try {
    const {token, user_id, email, username, department, role, password} = body;
    const payload = verifyTokenService({token});
    if(payload.role === "admin"){
      const status = await updateUsersRepo(user_id, email, username, department, role, password);
      return {status};
    }else {
      const status = updateStatus.canNotUpdate
      return {status}
    }
  } catch (err) {
    console.log(err);
    const status = updateStatus.canNotUpdate
    return {status}
  }
}