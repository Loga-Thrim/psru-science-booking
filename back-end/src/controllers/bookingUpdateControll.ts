import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import bookingUpdateRepo from "../repositories/bookingUpdateRepo";
import { bookingStatus } from "../enum/booking";
import { BOOKING_FAILURES } from "./bookingFailures";

export default async function bookingUpdateControll(req: Request, res: Response) {
  try {
    const tokenHeader = req.headers["authorization"] as string;
    const payload = verifyTokenService({ tokenHeader });

    const reservationId = req.params.id as string;
    const {
      date,
      start_time,
      end_time,
      number_of_users,
      reservation_type,
      reservation_reason,
      phone_number,
      equipment_needs,
      caretaker_name,
    } = req.body ?? {};

    const status = await bookingUpdateRepo(
      reservationId,
      payload.user_id,
      date,
      start_time,
      end_time,
      number_of_users,
      reservation_type,
      reservation_reason,
      phone_number,
      equipment_needs,
      caretaker_name
    );

    if (status === bookingStatus.success) {
      return res.status(200).json({ message: "แก้ไขการจองสำเร็จ" });
    }

    const failure = BOOKING_FAILURES[status];
    if (failure) {
      return res.status(failure.code).json({ message: failure.message });
    }
    return res.status(500).json({ message: "แก้ไขการจองไม่สำเร็จ" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
