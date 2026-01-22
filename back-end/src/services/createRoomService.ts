import { createRoomStatus } from "../enum/aut"
import { createRoomRequest, createRoomResponse  } from "../dto/roomManagement"
import createRoomRepo from "../repositories/createRoomRepo"

export default async function createRoomService(body:createRoomRequest):Promise<createRoomResponse>{
  try{
    const {status, room_id} = await createRoomRepo(body);
    return {status,room_id};
  } catch (err){
    console.error(err)
    const status = createRoomStatus.canNotCreate
    return {status};
  }
}