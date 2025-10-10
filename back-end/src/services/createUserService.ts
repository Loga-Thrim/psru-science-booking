import { createUserRequest, createUserResponse } from "../dto/aut";
import verifyTokenService from "./verifyTokenService";
import createUserRepo from "../repositories/createUserRepo";
import { registerStatus } from "../enum/aut";

export default async function createUserService(body: createUserRequest): Promise<createUserResponse> {
  try {
    const { token, email, username, department, role, password } = body;
    const payload = verifyTokenService({ token });
    if (payload.role === "admin") {
      const status = await createUserRepo(email,password, username, department, role);
      return { status };
    } else {
      const status = registerStatus.notPass;
      return { status };
    }
  } catch (err) {
    console.log(err);
    const status = registerStatus.notPass;
    return { status };
  }
}
