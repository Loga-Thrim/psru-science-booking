import { registerRequest, registerResponse } from "../dto/aut";
import registerRepo from "../repositories/registerRepo";
import { registerStatus } from "../enum/aut";

export default async function registerService(body: registerRequest):Promise<registerResponse> {
  try {
    const { username, email, password, faculty } = body;
    const result = await registerRepo(email, password, username, faculty);
    return {result};

  } catch (error) {
    console.error(error);
    const result = registerStatus.notPass;
    return {result};
  }
}
