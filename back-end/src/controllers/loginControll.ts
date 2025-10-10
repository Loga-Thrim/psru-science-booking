import { Request, Response } from "express";
import { loginStatus } from "../enum/aut";
import loginService from "../services/loginService";
import jwt from "jsonwebtoken";

export default async function loginControll(req: Request, res: Response) {
  try {
    const { result, rows } = await loginService(req.body);

    switch (result) {
      case loginStatus.emailNotFound:
        return res.status(401).json({ message: "Invalid email" });

      case loginStatus.wrongPassword:
        return res.status(401).json({ message: "Wrong password" });

      case loginStatus.notPass:
        return res.status(500).json({ message: "Server error" });

      case loginStatus.pass:
        const [{id, email, username, department, role}] = rows;
        const token = jwt.sign({id, email, username, department, role}, String(process.env.JWT_KEY), { expiresIn: '3d' })
        return res.status(200).json({ message: "OK", token: token, rows:rows});

      default:
        return res.status(500).json({ message: "Server error" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
