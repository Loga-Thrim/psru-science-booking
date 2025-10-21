import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function getRoomsImageRepo(id: string) {
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT * FROM room_images WHERE room_id = ?;", [id])
    connect.end()
    return rows;
  }catch (err) {
    console.error(err);
  }
}