import { Request, Response } from "express";
import verifyTokenService from "../services/verifyTokenService";
import bookingService from "../services/bookingService";
import { bookingStatus } from "../enum/booking";
export default async function bookingController(req: Request, res: Response){
    try{
        const { room_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone_number } = req.body;
        const tokenHeader = req.headers["authorization"] as string;
        const payload = verifyTokenService({ tokenHeader });
        const user_id = payload.user_id;
        const {status} = await bookingService({ room_id, date, start_time, end_time, number_of_users, reservation_type, reservation_reason, phone_number, user_id})
        if(status == bookingStatus.success){
            return res.status(200).json({ message: "จองห้องสำเร็จ"});
        } else {
            return res.status(400).json({ message: "จองห้องไม่สำเร็จ" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}