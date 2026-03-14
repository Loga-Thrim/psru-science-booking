import dbConnect from "../configs/dbConnect";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { unlink } from "fs/promises";
export default async function updateImageRepo(room_id: string, path: string, url: string) {
  try {
    const connect = await dbConnect();
    const [rows] = await connect.execute<RowDataPacket[]>("SELECT * FROM room_images WHERE room_id = ?", [room_id]);
    if(rows.length > 0){
      const [{image_path}] = rows;
      // Try to delete old file, but don't fail if it doesn't exist
      try {
        if (image_path && image_path !== 'external') {
          await unlink(image_path);
        }
      } catch (unlinkErr) {
        console.log('Old image file not found, skipping delete');
      }
      await connect.execute<ResultSetHeader>("UPDATE room_images SET image_path = ?, image_url = ? WHERE room_id = ?", [path, url, room_id] );
    }else {
      await connect.execute<ResultSetHeader>("INSERT INTO room_images (room_id, image_path, image_url) VALUES (?, ?, ?)", [room_id, path, url]);
    }
    connect.end();
  } catch (err) {
    console.error(err);
  }
}