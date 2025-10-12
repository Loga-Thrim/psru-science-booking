import { registerStatus, loginStatus } from "../enum/aut";
import { RowDataPacket } from "mysql2";
import { Role } from "./type";

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
