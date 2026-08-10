import { Express } from "express";
import dashboardControll from "../controllers/dashboardControll";
import checkConflictControll from "../controllers/checkConflictControll";
import checkUser from "../midleware/checkUser";
import checkApprover from "../midleware/checkApprover";

export default function dashboardRoute(app: Express) {
  // System-wide statistics include other people's bookings, so this is staff-only.
  app.get("/dashboard-stats", checkApprover, dashboardControll);
  app.post("/check-conflict", checkUser, checkConflictControll);
}
