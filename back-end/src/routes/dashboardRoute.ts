import { Express } from "express";
import dashboardControll from "../controllers/dashboardControll";
import checkConflictControll from "../controllers/checkConflictControll";
import checkUser from "../midleware/checkUser";

export default function dashboardRoute(app: Express) {
  app.get("/dashboard-stats", checkUser, dashboardControll);
  app.post("/check-conflict", checkUser, checkConflictControll);
}
