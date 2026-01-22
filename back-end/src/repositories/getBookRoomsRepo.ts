import dbConnect from "../configs/dbConnect";
import { RowDataPacket } from "mysql2";
export default async function getBookRoomsRepo() {
  try {
    const connect = await dbConnect();
    // Get all rooms
    const [rooms] = await connect.execute<RowDataPacket[]>("SELECT * FROM rooms;");
    
    // Get all room images
    const [images] = await connect.execute<RowDataPacket[]>("SELECT room_id, image_url FROM room_images;");
    
    connect.end();
    
    // Group images by room_id
    const imagesByRoom: Record<string, string[]> = {};
    for (const img of images) {
      if (!imagesByRoom[img.room_id]) {
        imagesByRoom[img.room_id] = [];
      }
      imagesByRoom[img.room_id].push(img.image_url);
    }
    
    // Attach images to rooms
    const roomsWithImages = rooms.map(room => ({
      ...room,
      images: imagesByRoom[room.room_id] || []
    }));
    
    return roomsWithImages;
  } catch (err) {
    console.error(err);
  }
}