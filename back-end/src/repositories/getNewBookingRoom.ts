import { RowDataPacket } from "mysql2";
import dbConnect from "../configs/dbConnect";
export default async function getNewBookingRoomRepo(id: string){
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT * FROM rooms WHERE room_id = ?;",[id]);
    connect.end()
    return rows;
  }catch (err) {
    console.error(err);
  }
}