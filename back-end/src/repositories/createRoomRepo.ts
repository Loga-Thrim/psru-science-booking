
import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { createRoomStatus } from "../enum/aut";
export default async function createRoomRepo( room_code:string, room_type:string, capacity:number, equipment:string, caretaker:string, description:string ) {
  try {
    const connect = await dbConnect();
    const [checkCode] = await connect.execute<RowDataPacket[]>("SELECT * FROM rooms WHERE room_code = ?;", [room_code]);
    if(checkCode.length > 0) return createRoomStatus.errorRoomCode;
    const [result] = await connect.execute<ResultSetHeader>(`INSERT INTO rooms (room_code, room_type, capacity, equipment, caretaker, description)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [room_code, room_type, capacity, equipment, caretaker, description]);

    if (result.affectedRows && result.affectedRows > 0) {
      connect.end();
      return createRoomStatus.created;
    } else {
      connect.end();
      return createRoomStatus.canNotCreate;
    }
  } catch (err) {
    console.error(err);
    return createRoomStatus.canNotCreate;
  }
}
