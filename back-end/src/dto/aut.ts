import { registerStatus, loginStatus } from "../enum/aut"
import { RowDataPacket } from "mysql2"
export interface registerRequest {
  username: string,
  email: string,
  password: string,
  faculty: string
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

export interface adminLoginRequest {
  email: string,
  password: string
}

export interface adminLoginResponse {
  token: string
}