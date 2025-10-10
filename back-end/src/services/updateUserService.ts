import { updateUserRequest, updateUserResponse } from "../dto/aut";
import { updateStatus } from "../enum/aut";
import updateUsersRepo from "../repositories/updateUserRepo";
import verifyTokenService from "./verifyTokenService";
export default async function updateUserServcie(body:updateUserRequest): Promise<updateUserResponse>{
  try {
    const {user_id, email, username, department, role, password} = body;
      const status = await updateUsersRepo(user_id, email, username, department, role, password);
      return {status};
  } catch (err) {
    console.log(err);
    const status = updateStatus.canNotUpdate
    return {status}
  }
}