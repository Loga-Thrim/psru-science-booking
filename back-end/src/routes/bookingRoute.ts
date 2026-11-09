import { Express } from "express";
import getRoomImageControll from "../controllers/getRoomImageControll";
import getBookRoomsControll from "../controllers/getBookRoomsControll";
import rateLimit from "../midleware/rateLimit";
import getNewBookingRoomControll from "../controllers/getBookingRoomControll";
import bookingController from "../controllers/bookingControll";
import bookingListControll from "../controllers/bookingListControll";
import bookingDeleteControll from "../controllers/bookingDeleteControll";
import roomScheduleControll from "../controllers/roomScheduleControll";

const TEN_MINUTES = 10 * 60 * 1000;
const TOO_MANY = "มีการใช้งานถี่เกินไป กรุณารอสักครู่แล้วลองใหม่";

export default function bookingRoute(app: Express){
  // Booking needs no account: browsing rooms, booking, and looking up or
  // cancelling by phone number are open to everyone. The writes are rate limited.
  app.get("/book-rooms", getBookRoomsControll);
  // Whole-month occupancy for the calendar views.
  app.get("/room-schedule", roomScheduleControll);
  app.get("/room-image/:id", getRoomImageControll);
  app.get("/book-room/:id", getNewBookingRoomControll);
  app.post("/booking", rateLimit(30, TEN_MINUTES, TOO_MANY), bookingController);
  app.get("/booking-list", rateLimit(120, TEN_MINUTES, TOO_MANY), bookingListControll);
  app.delete("/booking/:id", rateLimit(30, TEN_MINUTES, TOO_MANY), bookingDeleteControll);
  // There is no "move my booking": a guest cancels and books again.
}
