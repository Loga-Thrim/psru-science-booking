import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";

/**
 * Every booking that occupies a room across a date range.
 *
 * check-conflict answers one day at a time, which is fine while picking a slot
 * but means a month view would fire ~30 requests. This returns the whole span
 * in one query.
 *
 * Rejected bookings are left out: they never occupied the room.
 *
 * The booker's name is public: the booking form tells people who already holds
 * a slot. `includeDetails` (admins only) adds department and reason. Phone
 * numbers are never returned here.
 */
export interface ScheduleEntry {
  reservation_id: string;
  room_id: string;
  room_code: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  reservation_status: string;
  reservation_type: string;
  number_of_users: number;
  username?: string;
  department?: string;
  reservation_reason?: string;
}

export default async function roomScheduleRepo(
  from: string,
  to: string,
  roomId: string | null,
  includeDetails: boolean
): Promise<ScheduleEntry[]> {
  const connect = await dbConnect();
  try {
    const columns = [
      "res.reservation_id",
      "res.room_id",
      "r.room_code",
      "res.booking_date",
      "res.start_time",
      "res.end_time",
      "res.reservation_status",
      "res.reservation_type",
      "res.number_of_users",
      "COALESCE(res.booker_name, u.username) AS username",
    ];
    if (includeDetails) {
      columns.push("u.department", "res.reservation_reason");
    }

    let sql = `
      SELECT ${columns.join(", ")}
      FROM reservations res
      LEFT JOIN rooms r ON res.room_id = r.room_id
      LEFT JOIN users u ON res.user_id = u.user_id
      WHERE res.booking_date BETWEEN ? AND ?
        AND res.reservation_status <> 'rejected'
    `;
    const params: unknown[] = [from, to];

    if (roomId) {
      sql += " AND res.room_id = ?";
      params.push(roomId);
    }
    sql += " ORDER BY res.booking_date, res.start_time";

    const [rows] = await connect.execute<RowDataPacket[]>(sql, params);
    return rows as ScheduleEntry[];
  } finally {
    connect.end();
  }
}
