// Mirrors ROLES in back-end/src/dto/type.ts, which now rejects anything else.
export type UserRole = "admin" | "approver" | "user";

export interface UserLogin {
  user_id: string;
  email: string;
  role: UserRole;
  department: string;
  name: string;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  attendees: number;
  createdAt: Date;
}

export type UserRow = {
  // CHAR(8) in the database, e.g. "9BD9C27E" — not numeric.
  user_id: string;
  email: string;
  username: string;
  department: string;
  role: UserRole;
};

export type UpsertForm = {
  email: string;
  username: string;
  department: string;
  role: UserRole;
  password?: string;
};

// Must stay in sync with MIN_PASSWORD_LENGTH in back-end/src/dto/type.ts
export const MIN_PASSWORD_LENGTH = 8;

export const DEPARTMENTS = [
  "คณะครุศาสตร์",
  "คณะมนุษยศาสตร์และสังคมศาสตร์",
  "คณะวิทยาศาสตร์และเทคโนโลยี",
  "คณะวิทยาการจัดการ",
  "คณะสังคมศาสตร์และการพัฒนาท้องถิ่น",
  "คณะเทคโนโลยีการเกษตรและอาหาร",
  "คณะเทคโนโลยีอุตสาหกรรม",
  "คณะพยาบาลศาสตร์",
];

export interface Room {
  room_id: string;
  room_code: string;
  building?: string | null;
  floor?: string | null;
  capacity: number;
  description?: string | null;
  room_type: string;
  equipment?: string | null;
  caretaker?: string | null;
  contact_phone?: string | null;
  available_start_time?: string | null;
  available_end_time?: string | null;
  available_days?: string | null;
  advance_booking_days?: number | null;
  restrictions?: string | null;
  status: "avaliable" | "unavaliable" | "available" | "unavailable";
  images?: string[];
}
export type ReservationType = "teaching" | "exam" | "activity" | "other" | "";

// Booking wording lives in constants/bookingStatus.ts, which also owns the
// icons, colours and stepper positions. These re-exports keep the older import
// sites working without letting a second copy of the labels drift back in.
export {
  RESERVATION_TYPE_LABELS,
  getReservationTypeLabel as reservationTypeLabel,
} from "../constants/bookingStatus";

export { getStatusInfo } from "../constants/bookingStatus";

import { getStatusInfo as statusInfo } from "../constants/bookingStatus";

export const reservationStatusLabel = (status?: string | null): string =>
  status ? statusInfo(status).label : "-";

export type reservationRow = {
  reservation_id: string,
  room_id: string,
  user_id: string,
  booking_date: string,
  start_time: string,
  end_time: string,
  number_of_users: number,
  reservation_type: string,
  reservation_status: string,
  reservation_reason: string,
  equipment_needs?: string | null,
  caretaker_name?: string | null,
  rejection_reason: null | string,
  phone: string,
  email: string,
  username: string,
  department: string,
  role: string,
  // Room info from join
  room_code?: string,
  building?: string,
  floor?: string,
  room_type?: string,
  capacity?: number,
  equipment?: string,
  caretaker?: string,
  description?: string,
  contact_phone?: string,
}

export const ROOM_TYPE = [
  "ห้องประชุมใหญ่",
  "ห้องประชุมย่อย", 
  "ห้องเรียน",
  "ห้องอบรม/สัมมนา",
  "ห้องปฏิบัติการ",
  "ห้องปฏิบัติการคอมพิวเตอร์",
  "หอประชุม",
  "ห้องพักอาจารย์",
  "อื่นๆ"
];

export const ROOM_STATUS = ["available", "unavailable"];
export const BOOKING_STATUA = ["pending", "adminApproved", "approverApproved"];

export const BUILDINGS = [
  "อาคาร 1 (อาคารเรียนรวม)",
  "อาคาร 2 (อาคารปฏิบัติการ)",
  "อาคาร 3 (อาคารบริหาร)",
  "อาคาร 4 (อาคารวิทยาศาสตร์)",
  "อาคาร 5 (อาคารเทคโนโลยี)",
  "อาคารหอประชุม",
  "อาคารกิจกรรมนักศึกษา",
  "อื่นๆ"
];

export const FLOORS = ["1", "2", "3", "4", "5", "6", "7", "8", "ชั้นใต้ดิน", "ดาดฟ้า"];

export const EQUIPMENT_OPTIONS = [
  "โปรเจคเตอร์",
  "จอโปรเจคเตอร์",
  "ไมค์ลอย",
  "ไมค์สาย",
  "เครื่องเสียง/ลำโพง",
  "กระดานไวท์บอร์ด",
  "กระดานอัจฉริยะ (Smart Board)",
  "เครื่องปรับอากาศ",
  "พัดลม",
  "คอมพิวเตอร์",
  "ระบบ Video Conference",
  "กล้องวงจรปิด",
  "ระบบบันทึกการประชุม",
  "เครื่องพิมพ์",
  "โต๊ะประชุม",
  "เก้าอี้จัดเลี้ยง",
  "โพเดียม/แท่นบรรยาย",
  "ระบบแสงสว่าง",
  "ผ้าม่าน/มู่ลี่",
  "ตู้เย็น",
  "เครื่องทำน้ำร้อน-เย็น"
];

export const WEEKDAYS = [
  { value: "mon", label: "จันทร์" },
  { value: "tue", label: "อังคาร" },
  { value: "wed", label: "พุธ" },
  { value: "thu", label: "พฤหัสบดี" },
  { value: "fri", label: "ศุกร์" },
  { value: "sat", label: "เสาร์" },
  { value: "sun", label: "อาทิตย์" }
];