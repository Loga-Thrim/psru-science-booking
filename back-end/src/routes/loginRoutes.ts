import { Express } from "express";
import loginControll from "../controllers/loginControll";

export default function loginRoute(app: Express){
  app.post("/login",loginControll)
}