import { createUserRequest, createUserResponse } from "../dto/userManagement";
import createUserRepo from "../repositories/createUserRepo";
import { registerStatus } from "../enum/aut";

export default async function createUserService(body: createUserRequest): Promise<createUserResponse> {
  try {
    const { email, username, department, role, password } = body;
    const status = await createUserRepo(email,password, username, department, role);
    return { status };
  } catch (err) {
    console.error(err);
    const status = registerStatus.notPass;
    return { status };
  }
}
