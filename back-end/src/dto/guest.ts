// Bookers no longer have accounts: a name and a Thai phone number identify them.
// The phone number doubles as the key for looking up and cancelling bookings,
// so it is normalised the same way everywhere it is compared.

/** Digits only, e.g. "081-234 5678" -> "0812345678". Null when not a Thai number. */
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/\D/g, "");
  return /^0\d{8,9}$/.test(digits) ? digits : null;
}

export const MAX_NAME_LENGTH = 100;

/** Trimmed name with inner whitespace collapsed. Null when empty or too long. */
export function normalizeName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const name = input.trim().replace(/\s+/g, " ");
  if (name.length === 0 || name.length > MAX_NAME_LENGTH) return null;
  return name;
}
