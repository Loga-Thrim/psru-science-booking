import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function getUnapproveListRepo() {
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>(`
      SELECT * FROM reservations 
      LEFT JOIN users ON reservations.user_id  = users.user_id 
      WHERE reservations.reservation_status = 'pending';`);
    connect.end();
    return rows;
  } catch (err) {
    console.error(err);
  }
}