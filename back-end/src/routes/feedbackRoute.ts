import { Express } from "express";
import checkAdmin from "../midleware/checkAdmin";
import rateLimit from "../midleware/rateLimit";
import { getFeedback, submitFeedback } from "../controllers/feedbackControll";

export default function feedbackRoute(app: Express) {
  // Testers fill the form without an account, like booking.
  app.post("/feedback", rateLimit(300, 10 * 60 * 1000, "มีการใช้งานถี่เกินไป กรุณารอสักครู่แล้วลองใหม่"), submitFeedback);
  app.get("/feedback", checkAdmin, getFeedback);
}
