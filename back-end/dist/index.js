"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/register", (_req, res) => res.status(200).send("OK"));
const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1"; // ถ้าจะเข้าจากภายนอก/คอนเทนเนอร์ใช้ "0.0.0.0"
const server = app.listen(PORT, HOST, () => {
    console.log(`Listening on http://${HOST}:${PORT}`);
});
server.on("error", (err) => {
    console.error("Server error:", err);
});
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
