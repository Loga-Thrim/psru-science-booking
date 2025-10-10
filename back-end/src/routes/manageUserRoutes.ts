import { Express } from "express";
import createUserControll from "../controllers/createUserControll";
import getUsersControll from "../controllers/getUsersControll";
import deleteUserControll from "../controllers/deleteUserControll";
import updateUserControll from "../controllers/updateUserControll";
export default function manageUserRoutes(app: Express){
  app.get("/users", getUsersControll);
  app.post("/users", createUserControll);
  app.delete("/users", deleteUserControll);
  app.patch("/users", updateUserControll);
}