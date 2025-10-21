import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { deleteStatus } from "../enum/aut";
import { unlink } from "fs/promises";
export default async function deleteRoomRepo(id: string) {
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT * FROM room_images WHERE room_id = ?", [id]);
    if(rows.length > 0){
      const [{image_path}] = rows;
      await unlink(image_path);
    }

    await connect.execute<ResultSetHeader>("DELETE FROM room_images WHERE room_id = ?", [id]);

    const [result] = await connect.execute<ResultSetHeader>("DELETE FROM rooms WHERE room_id = ?", [id]);

    if (result.affectedRows && result.affectedRows > 0) {
      connect.end();
      return deleteStatus.deleted;
    } else {
      connect.end();
      return deleteStatus.canNotDelete;
    }
  } catch (err) {
    console.error(err);
    return deleteStatus.canNotDelete;
  }
}
