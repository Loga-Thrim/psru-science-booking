export type Role = "admin" | "approver" | "user";

export type RoomStatus = "available" | "unavailable";

export const ROLES: Role[] = ["admin", "approver", "user"];

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && (ROLES as string[]).includes(value);

export const MIN_PASSWORD_LENGTH = 8;

// Kept deliberately simple: length is the requirement that actually matters here,
// and complexity rules push users toward predictable substitutions.
export const isValidPassword = (value: unknown): value is string =>
  typeof value === "string" && value.length >= MIN_PASSWORD_LENGTH;

export const isValidEmail = (value: unknown): value is string =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
