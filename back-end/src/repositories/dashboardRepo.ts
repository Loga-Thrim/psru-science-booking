import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";

export interface DashboardStats {
  totalRooms: number;
  totalUsers: number;
  totalBookings: number;
  pendingApprovals: number;
  todayBookings: number;
  weeklyBookings: number;
  roomUtilization: { room_code: string; count: number }[];
  recentBookings: any[];
  bookingsByStatus: { status: string; count: number }[];
  bookingsByType: { type: string; count: number }[];
}

export default async function dashboardRepo(): Promise<DashboardStats> {
  const connect = await dbConnect();
  try {
    const [roomsResult] = await connect.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM rooms"
    );
    const totalRooms = roomsResult[0]?.count || 0;

    const [usersResult] = await connect.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM users"
    );
    const totalUsers = usersResult[0]?.count || 0;

    const [bookingsResult] = await connect.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM reservations"
    );
    const totalBookings = bookingsResult[0]?.count || 0;

    const [pendingResult] = await connect.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM reservations WHERE reservation_status = 'pending' OR reservation_status = 'adminApproved'"
    );
    const pendingApprovals = pendingResult[0]?.count || 0;

    const [todayResult] = await connect.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM reservations WHERE booking_date = CURDATE()"
    );
    const todayBookings = todayResult[0]?.count || 0;

    const [weeklyResult] = await connect.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM reservations WHERE booking_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)"
    );
    const weeklyBookings = weeklyResult[0]?.count || 0;

    const [utilizationResult] = await connect.execute<RowDataPacket[]>(`
      SELECT r.room_code, COUNT(res.reservation_id) as count 
      FROM rooms r 
      LEFT JOIN reservations res ON r.room_id = res.room_id 
      GROUP BY r.room_id, r.room_code 
      ORDER BY count DESC 
      LIMIT 5
    `);
    const roomUtilization = utilizationResult.map((row) => ({
      room_code: row.room_code,
      count: row.count,
    }));

    const [recentResult] = await connect.execute<RowDataPacket[]>(`
      SELECT res.*, r.room_code, u.username 
      FROM reservations res 
      LEFT JOIN rooms r ON res.room_id = r.room_id 
      LEFT JOIN users u ON res.user_id = u.user_id 
      ORDER BY res.reservation_id DESC 
      LIMIT 5
    `);
    const recentBookings = recentResult;

    const [statusResult] = await connect.execute<RowDataPacket[]>(`
      SELECT reservation_status as status, COUNT(*) as count 
      FROM reservations 
      GROUP BY reservation_status
    `);
    const bookingsByStatus = statusResult.map((row) => ({
      status: row.status,
      count: row.count,
    }));

    const [typeResult] = await connect.execute<RowDataPacket[]>(`
      SELECT reservation_type as type, COUNT(*) as count 
      FROM reservations 
      GROUP BY reservation_type
    `);
    const bookingsByType = typeResult.map((row) => ({
      type: row.type || "other",
      count: row.count,
    }));

    return {
      totalRooms,
      totalUsers,
      totalBookings,
      pendingApprovals,
      todayBookings,
      weeklyBookings,
      roomUtilization,
      recentBookings,
      bookingsByStatus,
      bookingsByType,
    };
  } finally {
    connect.end();
  }
}
