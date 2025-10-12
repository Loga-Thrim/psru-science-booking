import deleteUsersRepo from "../repositories/deleteUserRepo";
import { deleteUserRequest, deleteUserResponse } from "../dto/userManagement";
import { deleteStatus } from "../enum/aut";
import verifyTokenService from "./verifyTokenService";
export default async function deleteUserService(body:deleteUserRequest):Promise<deleteUserResponse> {
  try {
    const {user_id} = body;
      const status = await deleteUsersRepo(user_id);
      return {status};
  } catch (err){
    const status = deleteStatus.canNotDelete;
    console.error(err);
    return {status};
  }
}