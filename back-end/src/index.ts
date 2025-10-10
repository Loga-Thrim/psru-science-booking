import express,{Express} from "express";
import cors from "cors";
import {registerRoute, loginRoute, verifyTokenRoute, manageUserRoutes, createUserRoute, manageRoomRoute} from "./routes/routes"
import "dotenv/config";

const app:Express = express();
app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded());

try {
  registerRoute(app);
  loginRoute(app);
  verifyTokenRoute(app);
  manageUserRoutes(app);
  createUserRoute(app);
  manageRoomRoute(app);
}catch(err){
  console.error(err);
}

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server runing on port ${process.env.SERVER_PORT}`);
})


