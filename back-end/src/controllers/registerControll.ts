import { Request, Response } from "express";
import registerService from "../services/registerService";
import { registerStatus } from "../enum/aut";

export default async function registerController(req: Request, res: Response) {
  try {
    const {result} = await registerService(req.body);

    switch (result) {
      case registerStatus.alreadyHaveAcount:
        return res.status(409).json({ message: "You already have an account." });

      case registerStatus.alreadyHaveUserName:
        return res.status(409).json({ message: "This username is already taken." });

      case registerStatus.notPass:
        return res.status(500).json({ message: "Server error." });

      case registerStatus.pass:
        return res.status(201).json({ message: "OK" });

      default:
        return res.status(500).json({ message: "Unknown result." });
    }

  } catch (err) {
    console.error("[registerController] error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
