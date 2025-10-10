import { Express } from "express";
import getRoomControll from "../controllers/getRoomsControll";
import deleteRoomControll from "../controllers/deleteRoomControll";
import updateRoomControll from "../controllers/updateRoomControll";
import createRoomControll from "../controllers/createRoomControll";

export default function manageRoomRoute(app: Express){
  app.get("/rooms",getRoomControll)
  app.delete("/rooms/:id", deleteRoomControll)
  app.patch("/rooms/:id", updateRoomControll)
  app.post("/rooms", createRoomControll)
}