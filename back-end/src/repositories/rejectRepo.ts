import dbConnect from "../configs/dbConnect";
export default async function rejectRepo(reservationId: string, rejectionReason: string) {
  try {
    const connect = await dbConnect();
    await connect.execute(
      "UPDATE reservations SET reservation_status = 'rejected', rejection_reason = ? WHERE reservation_id = ?;",
      [rejectionReason, reservationId]
    );
    connect.end();
  } catch (err) {
    console.error(err);
  }
}