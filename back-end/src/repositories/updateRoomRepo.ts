
import dbConnect from "../configs/dbConnect";
import { ResultSetHeader } from "mysql2";
import { updateStatus } from "../enum/aut";
import { Room } from "../dto/roomManagement";
export default async function updateRoomRepo(id: string, room: Room) {
  try {
    const connect = await dbConnect();
    const [result] = await connect.execute<ResultSetHeader>("UPDATE rooms SET room_code = ?, room_type = ?, capacity = ?, description = ?, equipment =?, caretaker = ?, status = ? WHERE room_id = ?",
      [room.room_code, room.room_type, room.capacity, room.description, room.equipment, room.caretaker,room.room_status , id]);

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
