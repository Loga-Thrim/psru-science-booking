
import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { createRoomStatus } from "../enum/aut";
export default async function createRoomRepo( room_code:string, room_type:string, capacity:number, equipment:string, caretaker:string, description:string, room_status:string ) {
  try {
    const connect = await dbConnect();
    const [checkCode] = await connect.execute<RowDataPacket[]>("SELECT * FROM rooms WHERE room_code = ?;", [room_code]);
    if(checkCode.length > 0) return {status:createRoomStatus.errorRoomCode};

    const [result] = await connect.execute<ResultSetHeader>(`INSERT INTO rooms (room_code, room_type, capacity, equipment, caretaker, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [room_code, room_type, capacity, equipment, caretaker, description, room_status]);
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
