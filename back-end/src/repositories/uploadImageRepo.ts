import dbConnect from "../configs/dbConnect";
import type { ResultSetHeader } from "mysql2";
export default async function uploadImageRepo(room_id: string, path: string){
  try {
    const connect = await dbConnect();
    await connect.execute<ResultSetHeader>("INSERT INTO room_images (room_id, image_path) VALUES (?, ?)", [room_id, path]);
    connect.end();
  } catch(err){
    console.error(err);
  }
}