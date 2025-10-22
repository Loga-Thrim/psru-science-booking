import { Express } from "express";
import getRoomImageControll from "../controllers/getRoomImageControll";
import getBookRoomsControll from "../controllers/getBookRoomsControll";
import checkUser from "../midleware/checkUser";
import getNewBookingRoomControll from "../controllers/getBookingRoomControll";

export default function bookingRoute(app: Express){
  app.get("/book-rooms", checkUser, getBookRoomsControll);
  app.get("/room-image/:id", checkUser, getRoomImageControll);
  app.get("/book-room/:id", checkUser, getNewBookingRoomControll);
}