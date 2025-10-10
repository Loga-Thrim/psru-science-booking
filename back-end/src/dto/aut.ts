import { registerStatus, loginStatus, updateStatus, deleteStatus } from "../enum/aut"
import { RowDataPacket } from "mysql2"

export type Role = "admin" | "approver" | "user";

export interface registerRequest {
  username: string,
  email: string,
  password: string,
  department: string
}

export interface registerResponse {
  result: registerStatus
}

export interface loginRequest {
  email: string,
  password: string
}

export interface loginResponse {
  result: loginStatus
  rows: RowDataPacket[]
}

export interface verifyTokenRequest {
  token: string
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
  token: string;
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
  token: string;
  user_id: number;
}

export interface deleteUserResponse {
  status: deleteStatus
}

export interface updateUserRequest {
  token: string;
  user_id: number;
  email: string;
  username: string;
  department: string;
  role: string;
  password: string | undefined;
}

export interface updateUserResponse {
  status: updateStatus
}