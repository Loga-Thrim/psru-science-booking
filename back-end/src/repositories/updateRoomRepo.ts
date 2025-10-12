
import dbConnect from "../configs/dbConnect";
import { ResultSetHeader } from "mysql2";
import { updateStatus } from "../enum/aut";
import { room } from "../dto/aut";
export default async function updateRoomRepo(id: string, room: room) {
  try {
    const connect = await dbConnect();
    const [result] = await connect.execute<ResultSetHeader>("UPDATE rooms SET room_code = ?, room_type = ?, capacity = ?, description = ?, equipment =?, caretaker = ? WHERE room_id = ?",
      [room.room_code, room.room_type, room.capacity, room.description, room.equipment, room.caretaker, id]);

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
