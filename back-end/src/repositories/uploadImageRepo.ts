import dbConnect from "../configs/dbConnect";
import type { ResultSetHeader } from "mysql2";
export default async function uploadImageRepo(room_id: string, path: string, url: string){
  try {
    const connect = await dbConnect();
    await connect.execute<ResultSetHeader>("INSERT INTO room_images (room_id, image_path, image_url) VALUES (?, ?, ?)", [room_id, path, url]);
    connect.end();
  } catch(err){
    console.error(err);
  }
}