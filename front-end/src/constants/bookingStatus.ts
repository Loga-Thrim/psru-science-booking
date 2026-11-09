import {
  Clock,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "../types/types";

/**
 * Single source of truth for how a reservation_status is shown.
 *
 * The booking page and the approval page used to name the same four states
 * differently ("รอดำเนินการ" vs "รอแอดมินอนุมัติ" for the same `pending`),
 * which is confusing for admins because they see both screens.
 */
export type BookingStatus =
  | "pending"
  | "adminApproved"
  | "approverApproved"
  | "rejected";

export interface BookingStatusInfo {
  /** Short label for table cells and badges. */
  label: string;
  /** Plain-language explanation of what is happening and what to expect next. */
  description: string;
  /** Which step of the approval this is. -1 means the flow stopped. */
  step: number;
  icon: LucideIcon;
  /** Badge styling. Always paired with an icon so colour is never the only cue. */
  badgeClass: string;
  /** Fill colour for the completed part of the progress stepper. */
  dotClass: string;
}

/** ส่งคำขอ -> แอดมินอนุมัติ. A single admin step; there is no separate approver. */
export const TOTAL_APPROVAL_STEPS = 2;

export const BOOKING_STATUS: Record<BookingStatus, BookingStatusInfo> = {
  pending: {
    label: "รออนุมัติ",
    description: "ส่งคำขอแล้ว ช่วงเวลานี้ถูกล็อกไว้ให้แล้ว กำลังรอแอดมินอนุมัติ",
    step: 1,
    icon: Clock,
    badgeClass: "bg-amber-100 text-amber-900 ring-1 ring-amber-300",
    dotClass: "bg-amber-500",
  },
  // Left over from the old two-stage flow (migration 005 moves these to
  // approverApproved); shown as still waiting in case any slip through.
  adminApproved: {
    label: "รออนุมัติ",
    description: "ส่งคำขอแล้ว กำลังรอแอดมินอนุมัติ",
    step: 1,
    icon: ClipboardCheck,
    badgeClass: "bg-blue-100 text-blue-900 ring-1 ring-blue-300",
    dotClass: "bg-blue-600",
  },
  approverApproved: {
    label: "อนุมัติแล้ว",
    description: "อนุมัติเรียบร้อย ใช้ห้องได้ตามวันและเวลาที่จองไว้",
    step: 2,
    icon: CheckCircle2,
    badgeClass: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300",
    dotClass: "bg-emerald-600",
  },
  rejected: {
    label: "ไม่อนุมัติ",
    description: "คำขอนี้ไม่ได้รับอนุมัติ ดูเหตุผลที่แจ้งไว้ในรายละเอียด",
    step: -1,
    icon: XCircle,
    badgeClass: "bg-red-100 text-red-900 ring-1 ring-red-300",
    dotClass: "bg-red-600",
  },
};

const UNKNOWN_STATUS: BookingStatusInfo = {
  label: "ไม่ทราบสถานะ",
  description: "ไม่สามารถระบุสถานะของคำขอนี้ได้",
  step: -1,
  icon: Clock,
  badgeClass: "bg-gray-100 text-gray-900 ring-1 ring-gray-300",
  dotClass: "bg-gray-500",
};

export function getStatusInfo(status: string | null | undefined): BookingStatusInfo {
  if (!status) return UNKNOWN_STATUS;
  return BOOKING_STATUS[status as BookingStatus] ?? UNKNOWN_STATUS;
}

/** Names of the stages, used by the progress stepper. */
export const APPROVAL_STEP_LABELS = [
  "ส่งคำขอ",
  "แอดมินอนุมัติ",
];

/** Booking types are stored in English but must always be shown in Thai. */
export const RESERVATION_TYPE_LABELS: Record<string, string> = {
  teaching: "จัดการเรียนการสอน",
  exam: "สอบ",
  activity: "กิจกรรม/อบรม/ประชุม",
  meeting: "กิจกรรม/อบรม/ประชุม",
  other: "อื่นๆ",
};

export function getReservationTypeLabel(type: string | null | undefined): string {
  if (!type) return "ไม่ระบุ";
  return RESERVATION_TYPE_LABELS[type] ?? type;
}

/** Whether this role can approve or reject a booking in this status. Only admins approve. */
export function isActionable(status: string, role: UserRole): boolean {
  return role === "admin" && (status === "pending" || status === "adminApproved");
}
