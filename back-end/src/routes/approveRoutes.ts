import { Express } from "express";
import unapproveListControll from "../controllers/approveListControll";
import checkApprover from "../midleware/checkApprover";
import approveControll from "../controllers/approveControll";
import rejectControll from "../controllers/rejectControll";

export default function approveRoutes(app: Express) {
    app.get("/reservation-list", checkApprover, unapproveListControll);
    app.post("/approve", checkApprover, approveControll);
    app.post("/reject", checkApprover, rejectControll)
}