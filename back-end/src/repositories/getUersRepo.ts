import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function getUsersRepo() {
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT * FROM users;")
    connect.end()
    return rows;
  }catch (err) {
    console.log(err);
  }
}