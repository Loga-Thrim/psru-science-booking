import { registerRequest, registerResponse } from "../dto/aut";
import registerRepo from "../repositories/registerRepo";
import { registerStatus } from "../enum/aut";

export default async function registerService(body: registerRequest):Promise<registerResponse> {
  try {
    const { username, email, password, department } = body;
    const result = await registerRepo(email, password, username, department);
    return {result};
  } catch (error) {
    console.error(error);
    const result = registerStatus.notPass;
    return {result};
  }
}
