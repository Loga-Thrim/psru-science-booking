import { Express } from "express";
import getRoomControll from "../controllers/getRoomsControll";
import deleteRoomControll from "../controllers/deleteRoomControll";
import updateRoomControll from "../controllers/updateRoomControll";
import createRoomControll from "../controllers/createRoomControll";
import checkAdmin from "../midleware/checkAdmin";
import updateImageControll from "../controllers/updateImageControll";
import uploadImages from "../midleware/uploadImage";

export default function manageRoomRoute(app: Express){
  app.get("/rooms", checkAdmin, getRoomControll)
  app.delete("/rooms/:id", checkAdmin, deleteRoomControll)
  app.patch("/rooms/:id", checkAdmin, updateRoomControll)
  app.patch("/rooms-image/:id", checkAdmin, uploadImages, updateImageControll)
  app.post("/rooms", checkAdmin, createRoomControll)
}