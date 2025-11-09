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
  user_id: number;
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
  capacity: number;
  description?: string | null;
  room_type: string;
  equipment?: string | null;
  caretaker?: string | null;
  status: "avaliable" | "unavaliable";
}

export type reservationRow = {
  booking_date: string,
  end_time: string,
  number_of_users: number,
  phone: string,
  rejection_reason: null,
  reservation_id: string,
  reservation_reason: string,
  reservation_status: string,
  reservation_type: string,
  room_id: string,
  start_time: string,
  user_id: string;
}

export const ROOM_TYPE = ["ห้องอบรม", "ห้องเรียน", "ห้องสัมมนา"];
export const ROOM_STATUS = ["available", "unavailable"]