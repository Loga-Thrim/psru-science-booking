import dbConnect from "../configs/dbConnect";
import { ResultSetHeader } from "mysql2";
import { updateStatus } from "../enum/aut";
import { Room } from "../dto/roomManagement";

export default async function updateRoomRepo(id: string, room: Room) {
  try {
    const connect = await dbConnect();
    const [result] = await connect.execute<ResultSetHeader>(
      `UPDATE rooms SET 
        room_code = ?, 
        building = ?,
        floor = ?,
        room_type = ?, 
        capacity = ?, 
        equipment = ?, 
        caretaker = ?, 
        contact_phone = ?,
        available_start_time = ?,
        available_end_time = ?,
        available_days = ?,
        advance_booking_days = ?,
        restrictions = ?,
        description = ?, 
        status = ? 
      WHERE room_id = ?`,
      [
        room.room_code, 
        room.building || '',
        room.floor || '',
        room.room_type, 
        room.capacity, 
        room.equipment, 
        room.caretaker,
        room.contact_phone || '',
        room.available_start_time || '08:00',
        room.available_end_time || '17:00',
        room.available_days || 'mon,tue,wed,thu,fri',
        room.advance_booking_days || 3,
        room.restrictions || '',
        room.description, 
        room.room_status, 
        id
      ]
    );

    if (result.affectedRows && result.affectedRows > 0) {
      connect.end();
      return updateStatus.updated;
    } else {
      connect.end();
      return updateStatus.canNotUpdate;
    }
  } catch (err) {
    console.error(err);
    return updateStatus.canNotUpdate;
  }
}
