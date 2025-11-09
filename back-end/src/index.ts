import express,{Express} from "express";
import cors from "cors";
import {registerRoute, loginRoute, verifyTokenRoute, manageUserRoutes, createUserRoute, manageRoomRoute, uploadImageRoute, bookingRoute, approveRoutes} from "./routes/routes"
import path from "path";
import "dotenv/config";

const WEB_ORIGIN = process.env.WEB_ORIGIN;

const corsOptions: cors.CorsOptions = {
  origin: WEB_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

const app:Express = express();
app
  .use(cors(corsOptions))
  .use(express.json())
  .use(express.urlencoded());


app.use("/uploads", express.static(path.join(__dirname, "/", "uploads")));

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
}catch(err){
  console.error(err);
}

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server runing on port ${process.env.SERVER_PORT}`);
})


