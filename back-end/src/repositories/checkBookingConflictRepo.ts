import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";

export interface ConflictCheck {
  hasConflict: boolean;
  conflictingBookings: any[];
}

export default async function checkBookingConflictRepo(
  room_id: string,
  booking_date: string,
  start_time: string,
  end_time: string,
  exclude_reservation_id?: string
): Promise<ConflictCheck> {
  const connect = await dbConnect();
  try {
    let query = `
      SELECT res.*, r.room_code, u.username 
      FROM reservations res 
      LEFT JOIN rooms r ON res.room_id = r.room_id 
      LEFT JOIN users u ON res.user_id = u.user_id 
      WHERE res.room_id = ? 
      AND res.booking_date = ? 
      AND res.reservation_status != 'rejected'
      AND (
        (res.start_time < ? AND res.end_time > ?) OR
        (res.start_time >= ? AND res.start_time < ?) OR
        (res.end_time > ? AND res.end_time <= ?)
      )
    `;
    
    const params: any[] = [
      room_id,
      booking_date,
      end_time, start_time,
      start_time, end_time,
      start_time, end_time
    ];

    if (exclude_reservation_id) {
      query += " AND res.reservation_id != ?";
      params.push(exclude_reservation_id);
    }

    const [result] = await connect.execute<RowDataPacket[]>(query, params);
    
    return {
      hasConflict: result.length > 0,
      conflictingBookings: result,
    };
  } finally {
    connect.end();
  }
}
