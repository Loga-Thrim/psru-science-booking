import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { createRoomStatus } from "../enum/aut";

interface CreateRoomParams {
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

export default async function createRoomRepo(params: CreateRoomParams) {
  const {
    room_code,
    room_type,
    capacity,
    equipment,
    caretaker,
    description,
    room_status,
    building = '',
    floor = '',
    contact_phone = '',
    available_start_time = '08:00',
    available_end_time = '17:00',
    available_days = 'mon,tue,wed,thu,fri',
    advance_booking_days = 3,
    restrictions = ''
  } = params;

  try {
    const connect = await dbConnect();
    const [checkCode] = await connect.execute<RowDataPacket[]>("SELECT * FROM rooms WHERE room_code = ?;", [room_code]);
    if(checkCode.length > 0) return {status:createRoomStatus.errorRoomCode};

    const [result] = await connect.execute<ResultSetHeader>(
      `INSERT INTO rooms (room_code, building, floor, room_type, capacity, equipment, caretaker, contact_phone, available_start_time, available_end_time, available_days, advance_booking_days, restrictions, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [room_code, building, floor, room_type, capacity, equipment, caretaker, contact_phone, available_start_time, available_end_time, available_days, advance_booking_days, restrictions, description, room_status]
    );
    if (result.affectedRows && result.affectedRows > 0) {
      const [checkId] = await connect.execute<RowDataPacket[]>("SELECT room_id FROM rooms WHERE room_code = ?;", [room_code]);
      const [{room_id}] = checkId;
      connect.end();
      return {status:createRoomStatus.created, room_id};
    } else {
      connect.end();
      return {status:createRoomStatus.canNotCreate};
    }
  } catch (err) {
    console.error(err);
    return {status:createRoomStatus.canNotCreate};
  }
}
