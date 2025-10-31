import dbConnect from "../configs/dbConnect";
export default async function bookingDeleteRepo(userId: string, reservationId: string) {
  try {
    const connect = await dbConnect();
    await connect.execute("DELETE FROM reservations WHERE user_id = ? AND reservation_id = ?;", [userId, reservationId])
    connect.end()
  } catch (err) {
    console.error(err);
  }
}