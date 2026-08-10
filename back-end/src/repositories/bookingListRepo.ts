import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function bookingListRepo(id: string) {
  const connect = await dbConnect();
  try {
    // Explicit columns: the password hash must never reach the client.
    const [users] = await connect.execute<RowDataPacket[]>(
      "SELECT user_id, email, username, department, role FROM users WHERE user_id = ?;",
      [id]
    );

    const [reservations] = await connect.execute<RowDataPacket[]>(
      "SELECT * FROM reservations WHERE user_id = ? ORDER BY booking_date DESC, start_time DESC;",
      [id]
    );

    // One query for every room referenced, instead of one query per reservation.
    const roomIds = [...new Set(reservations.map((r) => r.room_id).filter(Boolean))];
    let rooms: RowDataPacket[] = [];
    if (roomIds.length > 0) {
      const placeholders = roomIds.map(() => "?").join(",");
      const [found] = await connect.execute<RowDataPacket[]>(
        `SELECT * FROM rooms WHERE room_id IN (${placeholders});`,
        roomIds
      );
      rooms = found;
    }

    return [{ user: [...users] }, { reservation: [...reservations] }, { rooms: [...rooms] }];
  } catch (err) {
    console.error(err);
  } finally {
    connect.end();
  }
}
