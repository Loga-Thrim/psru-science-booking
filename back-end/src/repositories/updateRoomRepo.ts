import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { updateStatus } from "../enum/aut";
import { Room } from "../dto/roomManagement";

export default async function updateRoomRepo(id: string, room: Room) {
  const connect = await dbConnect();
  try {
    const [existing] = await connect.execute<RowDataPacket[]>("SELECT room_id FROM rooms WHERE room_id = ?", [id]);
    if (existing.length === 0) return updateStatus.notFound;

    const [clash] = await connect.execute<RowDataPacket[]>(
      "SELECT room_id FROM rooms WHERE room_code = ? AND room_id <> ?",
      [room.room_code, id]
    );
    if (clash.length > 0) return updateStatus.duplicateRoomCode;

    await connect.execute<ResultSetHeader>(
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

    // affectedRows is 0 when nothing actually changed, which is still success.
    return updateStatus.updated;
  } catch (err) {
    console.error(err);
    return updateStatus.canNotUpdate;
  } finally {
    connect.end();
  }
}
