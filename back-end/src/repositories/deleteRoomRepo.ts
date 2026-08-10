import dbConnect from "../configs/dbConnect";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { deleteStatus } from "../enum/aut";
import { unlink } from "fs/promises";

export default async function deleteRoomRepo(id: string) {
  const connect = await dbConnect();
  try {
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT image_path FROM room_images WHERE room_id = ?", [id]);
    // Remove every uploaded file for this room, not just the first one.
    await Promise.all(
      rows
        .filter((r) => r.image_path && r.image_path !== "external")
        .map((r) => unlink(r.image_path).catch(() => undefined))
    );

    await connect.execute<ResultSetHeader>("DELETE FROM room_images WHERE room_id = ?", [id]);

    const [result] = await connect.execute<ResultSetHeader>("DELETE FROM rooms WHERE room_id = ?", [id]);

    return result.affectedRows > 0 ? deleteStatus.deleted : deleteStatus.canNotDelete;
  } catch (err) {
    console.error(err);
    return deleteStatus.canNotDelete;
  } finally {
    connect.end();
  }
}
