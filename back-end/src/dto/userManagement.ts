import { Role } from "./type";
import { registerStatus, deleteStatus, updateStatus } from "../enum/aut";

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