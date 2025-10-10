import dbConnect from "../configs/dbConnect";
import { ResultSetHeader } from "mysql2";
import { deleteStatus } from "../enum/aut";
export default async function deleteRoomRepo(id: string) {
  try {
    const connect = await dbConnect();
    const [result] = await connect.execute<ResultSetHeader>("DELETE FROM rooms WHERE room_id = ?", [id]);

    if (result.affectedRows && result.affectedRows > 0) {
      connect.end();
      return deleteStatus.deleted;
    } else {
      connect.end();
      return deleteStatus.canNotDelete;
    }
  } catch (err) {
    console.log(err);
    return deleteStatus.canNotDelete;
  }
}
