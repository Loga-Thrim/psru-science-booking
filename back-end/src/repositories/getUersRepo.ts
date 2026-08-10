import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function getUsersRepo() {
  try {
    const connect = await dbConnect();
    // Columns are listed explicitly so the password hash never leaves the server.
    const [rows] = await connect.execute<RowDataPacket[]>(
      "SELECT user_id, email, username, department, role FROM users;"
    )
    connect.end()
    return rows;
  }catch (err) {
    console.error(err);
  }
}
