import { Express } from "express";
import verifyTokenControll from "../controllers/verifyTokenControll";
export default function verifyTokenRoute(app: Express){
  app.post("/verify-token", verifyTokenControll);
}