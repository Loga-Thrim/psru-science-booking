// routes/uploadImageRoute.ts
import { Express } from "express";
import checkAdmin from "../midleware/checkAdmin";
import uploadImages from "../midleware/uploadImage";
import uploadImageControll from "../controllers/uploadImageControll";


export default function uploadImageRoute(app: Express) {
  app.post("/upload-image", checkAdmin, uploadImages, uploadImageControll);
}
