import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function getUnapproveListRepo() {
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT * FROM reservations WHERE reservation_status =  'pending';");
    connect.end();
    return rows;
  } catch (err) {
    console.error(err);
  }
}