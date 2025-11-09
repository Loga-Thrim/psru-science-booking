import { Express } from "express";
import unapproveListControll from "../controllers/approveListControll";
import checkApprover from "../midleware/checkApprover";
export default function approveRoutes(app: Express) {
    app.get("/reservation-list", checkApprover, unapproveListControll);
}