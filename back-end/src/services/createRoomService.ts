import { createRoomStatus } from "../enum/aut"
import { createRoomRequest, createRoomResponse  } from "../dto/roomManagement"
import createRoomRepo from "../repositories/createRoomRepo"

export default async function createRoomService(body:createRoomRequest):Promise<createRoomResponse>{
  try{
    const { room_code, room_type, capacity, equipment, caretaker, description, room_status} = body;
    const {status, room_id} = await createRoomRepo( room_code, room_type, capacity, equipment, caretaker, description, room_status);
    return {status,room_id};
  } catch (err){
    console.error(err)
    const status = createRoomStatus.canNotCreate
    return {status};
  }

}