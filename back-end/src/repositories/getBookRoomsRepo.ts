import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function getBookRoomsRepo() {
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT * FROM rooms WHERE status = 'available';")
    connect.end()
    return rows;
  }catch (err) {
    console.error(err);
  }
}