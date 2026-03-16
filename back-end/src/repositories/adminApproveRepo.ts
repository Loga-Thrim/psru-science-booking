import dbConnect from "../configs/dbConnect";
export default async function adminApproveRepo(reservationId: string) {
    try {
        const connect = await dbConnect();
        await connect.execute(
            "UPDATE reservations SET reservation_status = 'adminApproved' WHERE reservation_id = ? AND reservation_status = 'pending'",
            [reservationId]
        );
        connect.end();
    } catch (err) {
        console.error(err);
    }
}