import { Express } from "express";
import registerControll from "../controllers/registerControll";
export default function registerRoute(app:Express):void{
  app.post("/register",registerControll);
}
