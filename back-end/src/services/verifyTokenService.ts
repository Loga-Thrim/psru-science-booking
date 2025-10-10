import jwt from "jsonwebtoken"
import { verifyTokenRequest , verifyTokenResponse } from "../dto/aut";

export default function verifyTokenService(body: verifyTokenRequest):verifyTokenResponse{
  const token = body.token;
  const payload = jwt.verify(token,process.env.JWT_KEY as string) as verifyTokenResponse;
  return payload;
}