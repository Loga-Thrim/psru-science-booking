import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function getRoomsRepo() {
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT * FROM rooms;")
    connect.end()
    return rows;
  }catch (err) {
    console.log(err);
  }
}