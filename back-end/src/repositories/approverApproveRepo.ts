
import dbConnect from "../configs/dbConnect";
export default async function approverApproveRepo(room_id: string, user_id:string) {
    try {
        const connect = await dbConnect();
        await connect.execute("UPDATE reservations SET reservation_status = 'approverApproved' WHERE room_id = ? AND user_id = ?;",[room_id, user_id]);
        connect.end();
    } catch (err) {
        console.error(err);
    }
}