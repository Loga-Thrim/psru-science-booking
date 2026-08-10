import jwt from "jsonwebtoken"
import { verifyTokenRequest , verifyTokenResponse } from "../dto/aut";

export default function verifyTokenService({tokenHeader}: verifyTokenRequest):verifyTokenResponse{
  if (typeof tokenHeader !== "string" || tokenHeader.trim().length === 0) {
    const err: any = new Error("Missing Authorization header");
    err.name = "JsonWebTokenError";
    throw err;
  }

  // Accepts both "Bearer <token>" and a bare token.
  const parts = tokenHeader.trim().split(/\s+/);
  const token = parts.length > 1 ? parts[1] : parts[0];
  if (!token) {
    const err: any = new Error("Malformed Authorization header");
    err.name = "JsonWebTokenError";
    throw err;
  }

  // algorithms is pinned so a token claiming "alg":"none" can never be accepted.
  const payload = jwt.verify(token, process.env.JWT_KEY as string, {
    algorithms: ["HS256"],
  }) as verifyTokenResponse;
  return payload;
}
