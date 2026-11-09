import { Express } from "express";
import unapproveListControll from "../controllers/approveListControll";
import checkAdmin from "../midleware/checkAdmin";
import approveControll from "../controllers/approveControll";
import rejectControll from "../controllers/rejectControll";

export default function approveRoutes(app: Express) {
    app.get("/reservation-list", checkAdmin, unapproveListControll);
    app.post("/approve", checkAdmin, approveControll);
    app.post("/reject", checkAdmin, rejectControll)
}