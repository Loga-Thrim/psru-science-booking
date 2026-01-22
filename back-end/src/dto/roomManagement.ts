import { createRoomStatus, deleteStatus, updateStatus } from "../enum/aut";

export interface createRoomRequest {
  room_code: string;
  room_type: string;
  capacity: number;
  equipment: string;
  caretaker: string;
  description: string;
  room_status: string;
  building?: string;
  floor?: string;
  contact_phone?: string;
  available_start_time?: string;
  available_end_time?: string;
  available_days?: string;
  advance_booking_days?: number;
  restrictions?: string;
}

export interface createRoomResponse {
  status: createRoomStatus;
  room_id?: string;
}

export interface deleteRoomRequest {
  room_id: string;
}

export interface deleteRoomResponse {
  status: deleteStatus;
}

export interface Room {
  room_id?: string;
  room_code: string;
  building?: string;
  floor?: string;
  room_type: string;
  capacity: number;
  equipment: string;
  caretaker: string;
  contact_phone?: string;
  available_start_time?: string;
  available_end_time?: string;
  available_days?: string;
  advance_booking_days?: number;
  restrictions?: string;
  description: string;
  room_status: string;
}

export interface updateRoomRequest {
  id: string;
  room: Room;
}

export interface updateRoomResponse {
  status: updateStatus;
}
