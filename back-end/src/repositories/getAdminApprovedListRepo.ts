
import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function getAdminApprovedListRepo() {
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>(`
      SELECT reservations.*, users.email, users.username, users.department, users.role,
             rooms.room_code, rooms.building, rooms.floor, rooms.room_type
      FROM reservations 
      LEFT JOIN users ON reservations.user_id = users.user_id 
      LEFT JOIN rooms ON reservations.room_id = rooms.room_id
      WHERE reservations.reservation_status = 'adminApproved';
      `);
    connect.end();
    return rows;
  } catch (err) {
    console.error(err);
  }
}