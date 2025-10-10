import deleteUsersRepo from "../repositories/deleteUserRepo";
import { deleteUserRequest, deleteUserResponse } from "../dto/aut";
import { deleteStatus } from "../enum/aut";
import verifyTokenService from "./verifyTokenService";
export default async function deleteUserService(body:deleteUserRequest):Promise<deleteUserResponse> {
  try {
    const {token, user_id} = body;
    console.log(body)
    const payload = verifyTokenService({token});
    if(payload.role === "admin"){
      console.log("admin")
      const status = await deleteUsersRepo(user_id);
      return {status};
    }else {
      const status = deleteStatus.canNotDelete;
      return {status};
    }
  } catch (err){
    const status = deleteStatus.canNotDelete;
    console.log(err);
    return {status};
  }

}