import {
  registerStatus,
  loginStatus,
  updateStatus,
  deleteStatus,
  createRoomStatus
} from "../enum/aut";
import { RowDataPacket } from "mysql2";

export type Role = "admin" | "approver" | "user";

export interface registerRequest {
  username: string;
  email: string;
  password: string;
  department: string;
}

export interface registerResponse {
  result: registerStatus;
}

export interface loginRequest {
  email: string;
  password: string;
}

export interface loginResponse {
  result: loginStatus;
  rows: RowDataPacket[];
}

export interface verifyTokenRequest {
  tokenHeader: string;
}

export interface verifyTokenResponse {
  email: string;
  username: string;
  department: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface createUserRequest {
  email: string;
  username: string;
  department: string;
  role: Role;
  password: string;
}

export interface createUserResponse {
  status: registerStatus;
}

export interface deleteUserRequest {
  user_id: number;
}

export interface deleteUserResponse {
  status: deleteStatus;
}

export interface updateUserRequest {
  user_id: number;
  email: string;
  username: string;
  department: string;
  role: string;
  password: string | undefined;
}

export interface updateUserResponse {
  status: updateStatus;
}

export interface createRoomRequest {
  room_code: string | "";
  room_type: string | "";
  capacity: number;
  equipment: string | "";
  caretaker: string | "";
  description: string | "";
}

export interface createRoomResponse {
  status: createRoomStatus;
}

export interface deleteRoomRequest {
  room_id: string;
}

export interface deleteRoomResponse {
  status: deleteStatus;
}

export interface room {
  room_code: string;
  room_type: string;
  capacity: number;
  equipment: string;
  caretaker: string;
  description: string;
}

export interface updateRoomRequest {
  id: string,
  room: room;
}

export interface updateRoomResponse {
  status: updateStatus;
}
