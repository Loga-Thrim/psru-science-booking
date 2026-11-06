import { Express } from "express";
import getRoomImageControll from "../controllers/getRoomImageControll";
import getBookRoomsControll from "../controllers/getBookRoomsControll";
import checkUser from "../midleware/checkUser";
import getNewBookingRoomControll from "../controllers/getBookingRoomControll";
import bookingController from "../controllers/bookingControll";
import bookingListControll from "../controllers/bookingListControll";
import bookingDeleteControll from "../controllers/bookingDeleteControll";
import bookingUpdateControll from "../controllers/bookingUpdateControll";
import roomScheduleControll from "../controllers/roomScheduleControll";

export default function bookingRoute(app: Express){
  app.get("/book-rooms", checkUser, getBookRoomsControll);
  // Whole-month occupancy for the calendar views.
  app.get("/room-schedule", checkUser, roomScheduleControll);
  app.get("/room-image/:id", checkUser, getRoomImageControll);
  app.get("/book-room/:id", checkUser, getNewBookingRoomControll);
  app.post("/booking", checkUser, bookingController);
  app.get("/booking-list", checkUser, bookingListControll)
  app.patch("/booking/:id", checkUser, bookingUpdateControll)
  app.delete("/booking/:id", checkUser, bookingDeleteControll)
}