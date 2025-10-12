import { Express } from "express";
import createUserControll from "../controllers/createUserControll";
import getUsersControll from "../controllers/getUsersControll";
import deleteUserControll from "../controllers/deleteUserControll";
import updateUserControll from "../controllers/updateUserControll";
import checkAdmin from "../midleware/checkAdmin";

export default function manageUserRoutes(app: Express){
  app.get("/users", checkAdmin, getUsersControll);
  app.post("/users", checkAdmin, createUserControll);
  app.delete("/users", checkAdmin, deleteUserControll);
  app.patch("/users", checkAdmin, updateUserControll);
}