import { Express } from "express";
import getBookRoomsControll from "../controllers/getBookRoomsControll";
import checkUser from "../midleware/checkUser";
export default function bookingRoute(app: Express){
  app.get("/book-rooms", checkUser, getBookRoomsControll);

}