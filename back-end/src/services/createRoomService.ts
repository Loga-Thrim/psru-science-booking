import { createRoomStatus } from "../enum/aut"
import { createRoomRequest, createRoomResponse  } from "../dto/aut"
import createRoomRepo from "../repositories/createRoomRepo"

export default async function createRoomService(body:createRoomRequest):Promise<createRoomResponse>{
  try{
    const { room_code, room_type, capacity, equipment, caretaker, description} = body;
    const status = await createRoomRepo( room_code, room_type, capacity, equipment, caretaker, description);
    return {status};
  } catch (err){
    console.error(err)
    const status = createRoomStatus.canNotCreate
    return {status};
  }

}