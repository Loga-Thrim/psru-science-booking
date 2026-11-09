import { Express } from "express";
import dashboardControll from "../controllers/dashboardControll";
import checkConflictControll from "../controllers/checkConflictControll";
import checkAdmin from "../midleware/checkAdmin";

export default function dashboardRoute(app: Express) {
  // System-wide statistics include other people's bookings, so this is staff-only.
  app.get("/dashboard-stats", checkAdmin, dashboardControll);
  // Public: the booking form uses it to grey out taken slots.
  app.post("/check-conflict", checkConflictControll);
}
