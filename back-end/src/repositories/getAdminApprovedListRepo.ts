
import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function getAdminApprovedListRepo() {
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT * FROM reservations WHERE reservation_status =  'adminApproved';");
    connect.end();
    return rows;
  } catch (err) {
    console.error(err);
  }
}