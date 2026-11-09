import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";

/**
 * Every booking made with this phone number, newest first, plus the rooms they
 * reference. Bookers have no accounts, so the phone number is their key.
 */
export default async function bookingListRepo(phone: string) {
  const connect = await dbConnect();
  try {
    const [reservations] = await connect.execute<RowDataPacket[]>(
      "SELECT * FROM reservations WHERE phone = ? ORDER BY booking_date DESC, start_time DESC;",
      [phone]
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

    return [{ reservation: [...reservations] }, { rooms: [...rooms] }];
  } finally {
    connect.end();
  }
}
