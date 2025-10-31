import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function bookingListRepo(id: string) {
  try {
    const connect = await dbConnect();
    const [rows1] = await connect.execute<RowDataPacket[]>("SELECT * FROM users WHERE user_id = ?;", [id])
    const [rows2] = await connect.execute<RowDataPacket[]>("SELECT * FROM reservations WHERE user_id = ?;", [id])
    const roomRowsArrays = await Promise.all(
      rows2.map(async (e) => {
        const [rows4] = await connect.execute<RowDataPacket[]>(
          "SELECT * FROM rooms WHERE room_id = ?;",
          [e.room_id]
        );
        return rows4;
      })
    );

    const rows3 = roomRowsArrays.flat();
    const rows = [{ user: [...rows1] }, { reservation: [...rows2] }, { rooms: [...rows3] }];
    connect.end()
    return rows;
  } catch (err) {
    console.error(err);
  }
}