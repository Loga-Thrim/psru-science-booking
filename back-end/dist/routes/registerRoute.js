"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerRoute;
const registerControll_1 = __importDefault(require("../controllers/registerControll"));
function registerRoute(app) {
    app.get("/register", registerControll_1.default);
}
