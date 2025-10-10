import { createUserRequest, createUserResponse } from "../dto/aut";
import verifyTokenService from "./verifyTokenService";
import createUserRepo from "../repositories/createUserRepo";
import { registerStatus } from "../enum/aut";

export default async function createUserService(body: createUserRequest): Promise<createUserResponse> {
  try {
    const { email, username, department, role, password } = body;
    const status = await createUserRepo(email,password, username, department, role);
    return { status };
  } catch (err) {
    console.log(err);
    const status = registerStatus.notPass;
    return { status };
  }
}
