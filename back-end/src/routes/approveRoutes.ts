import { Express } from "express";
import unapproveListControll from "../controllers/approveListControll";
import checkApprover from "../midleware/checkApprover";
import approveControll from "../controllers/approveControll";
export default function approveRoutes(app: Express) {
    app.get("/reservation-list", checkApprover, unapproveListControll);
    app.post("/approve", checkApprover, approveControll);
}