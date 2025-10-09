import {Express} from "express"
import adminLoginControll from "../controllers/adminLoginControll"
export default function adminLoginRoute(app: Express){
  app.post("/admin-login", adminLoginControll);
}