/**
 * Thai dates everywhere use the Buddhist era (2569, not 2026).
 *
 * dayjs's `YYYY` token emits the Gregorian year even under the `th` locale, so
 * the booking screens disagreed with every other page. These helpers go
 * through Intl, which applies the Buddhist calendar properly.
 */

const BANGKOK = "Asia/Bangkok";

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/** "วันพุธที่ 12 สิงหาคม 2569" */
export function thaiFullDate(value: string | Date): string {
  try {
    return toDate(value).toLocaleDateString("th-TH", {
      timeZone: BANGKOK,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

/** "12 ส.ค. 2569" — for tight spaces like summary chips. */
export function thaiShortDate(value: string | Date): string {
  try {
    return toDate(value).toLocaleDateString("th-TH", {
      timeZone: BANGKOK,
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

/** "สิงหาคม 2569" — calendar headers. */
export function thaiMonthYear(value: string | Date): string {
  try {
    return toDate(value).toLocaleDateString("th-TH", {
      timeZone: BANGKOK,
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}
