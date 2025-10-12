import { createRoomStatus, deleteStatus, updateStatus } from "../enum/aut";
export interface createRoomRequest {
  room_code: string | "";
  room_type: string | "";
  capacity: number;
  equipment: string | "";
  caretaker: string | "";
  description: string | "";
  room_status: string | "";
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
  room_code: string;
  room_type: string;
  capacity: number;
  equipment: string;
  caretaker: string;
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
