import dbConnect from "../configs/dbConnect";
export default async function approverApproveRepo(reservationId: string) {
    try {
        const connect = await dbConnect();
        await connect.execute(
            "UPDATE reservations SET reservation_status = 'approverApproved' WHERE reservation_id = ? AND reservation_status = 'adminApproved';",
            [reservationId]
        );
        connect.end();
    } catch (err) {
        console.error(err);
    }
}