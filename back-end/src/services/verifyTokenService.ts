import jwt from "jsonwebtoken"
import { verifyTokenRequest , verifyTokenResponse } from "../dto/aut";

export default function verifyTokenService({tokenHeader}: verifyTokenRequest):verifyTokenResponse{
  const token = tokenHeader.split(" ")[1];;
  const payload = jwt.verify(token,process.env.JWT_KEY as string) as verifyTokenResponse;
  return payload;
}