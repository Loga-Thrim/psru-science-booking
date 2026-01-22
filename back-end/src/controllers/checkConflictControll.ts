import { Request, Response } from "express";
import checkBookingConflictRepo from "../repositories/checkBookingConflictRepo";

export default async function checkConflictControll(req: Request, res: Response) {
  try {
    const { room_id, booking_date, start_time, end_time, exclude_reservation_id } = req.body;
    
    if (!room_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const result = await checkBookingConflictRepo(
      room_id,
      booking_date,
      start_time,
      end_time,
      exclude_reservation_id
    );
    
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบ" });
  }
}
