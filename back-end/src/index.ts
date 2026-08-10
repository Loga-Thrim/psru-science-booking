import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import {registerRoute, loginRoute, verifyTokenRoute, manageUserRoutes, createUserRoute, manageRoomRoute, uploadImageRoute, bookingRoute, approveRoutes, dashboardRoute} from "./routes/routes"
import "dotenv/config";
import { UPLOAD_DIR } from "./midleware/uploadImage";

// Refuse to boot without a signing key: falling back to a default would make
// every token in the system forgeable.
if (!process.env.JWT_KEY) {
  console.error("FATAL: JWT_KEY is not set. Refusing to start.");
  process.exit(1);
}

const WEB_ORIGIN = process.env.WEB_ORIGIN;

const corsOptions: cors.CorsOptions = {
  // With no WEB_ORIGIN configured, allow same-origin requests only rather than every origin.
  origin: WEB_ORIGIN ? WEB_ORIGIN.split(",").map((o) => o.trim()) : false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

const app:Express = express();
app
  .use(cors(corsOptions))
  .use(express.json({ limit: "1mb" }))
  .use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/uploads", express.static(UPLOAD_DIR));

try {
  registerRoute(app);
  loginRoute(app);
  verifyTokenRoute(app);
  manageUserRoutes(app);
  createUserRoute(app);
  manageRoomRoute(app);
  uploadImageRoute(app);
  bookingRoute(app);
  approveRoutes(app);
  dashboardRoute(app);
}catch(err){
  console.error(err);
}

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "ไม่พบเส้นทางที่ร้องขอ" });
});

// Without this, Express renders its HTML error page and leaks a stack trace to the client.
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(err?.status && err.status >= 400 && err.status < 600 ? err.status : 500)
     .json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server runing on port ${process.env.SERVER_PORT}`);
})
