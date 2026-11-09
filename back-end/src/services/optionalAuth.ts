import { Request } from "express";
import verifyTokenService from "./verifyTokenService";
import { verifyTokenResponse } from "../dto/aut";

/**
 * The signed-in admin behind a request, or null for a guest.
 *
 * Public endpoints accept both: a missing or invalid token just means "guest",
 * rather than the 401 that the staff-only middleware returns.
 */
export default function optionalAuth(req: Request): verifyTokenResponse | null {
  const tokenHeader = req.headers["authorization"];
  if (typeof tokenHeader !== "string") return null;
  try {
    const payload = verifyTokenService({ tokenHeader });
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}
