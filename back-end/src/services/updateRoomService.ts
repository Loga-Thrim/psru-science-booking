import { updateStatus } from "../enum/aut"
import { updateRoomRequest, updateRoomResponse } from "../dto/roomManagement"
import updateRoomRepo from "../repositories/updateRoomRepo";

export default async function updateRoomService({id, room}:updateRoomRequest):Promise<updateRoomResponse>{
  try{
    const status = await updateRoomRepo(id,room);
    return {status};
  }catch(err){
    console.error(err);
    const status = updateStatus.canNotUpdate
    return {status};
  }

}