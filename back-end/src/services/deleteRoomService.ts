
import { deleteStatus } from "../enum/aut"
import { deleteRoomRequest, deleteRoomResponse } from "../dto/roomManagement"
import deleteRoomRepo from "../repositories/deleteRoomRepo";

export default async function deleteRoomService({room_id}: deleteRoomRequest): Promise<deleteRoomResponse>{
  try {
    const status = await deleteRoomRepo(room_id);
    return {status};

  }catch (err){
    const status = deleteStatus.canNotDelete;
    console.error(err);
    return {status};
  }

}