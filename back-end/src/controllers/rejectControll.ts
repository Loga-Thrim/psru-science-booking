import { Request, Response } from "express";
import rejectRepo from "../repositories/rejectRepo";
export default async function rejectControll(req: Request, res: Response) {
  try {
    const { reservationId, rejectionReason } = req.body;
    await rejectRepo(reservationId, rejectionReason);
    res.status(200).json({"message": "Success"});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
}