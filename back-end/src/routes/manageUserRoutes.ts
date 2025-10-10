import { Express } from "express";
import createUserControll from "../controllers/createUserControll";
import getUsersControll from "../controllers/getUsersControll";
import deleteUserControll from "../controllers/deleteUserControll";
import updateUserControll from "../controllers/updateUserControll";
export default function manageUserRoutes(app: Express){
  app.post("/get-users", getUsersControll);
  app.post("/create-user", createUserControll);
  app.delete("/delete-user", deleteUserControll);
  app.patch("/update-user", updateUserControll);
}