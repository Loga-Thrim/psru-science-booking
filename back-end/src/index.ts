import express,{Express} from "express";
import cors from "cors";
import {registerRoute, loginRoute, adminLoginRoute, verifyTokenRoute} from "./routes/routes"
import "dotenv/config";

const app:Express = express();
app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded());

try {
  registerRoute(app);
  loginRoute(app);
  adminLoginRoute(app);
  verifyTokenRoute(app);
}catch(err){
  console.error(err);
}

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server runing on port ${process.env.SERVER_PORT}`);
})


