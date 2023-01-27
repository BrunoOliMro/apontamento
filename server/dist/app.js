"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const router_1 = __importDefault(require("./api/router"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '0.20kb' }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("static"));
app.use((0, cors_1.default)({ credentials: true, origin: ['http://localhost:3000', 'http://192.168.97.108:3000'] }));
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.baseUrl}${req.path}`);
    console.log("Body: ", req.body);
    next();
});
app.get("/", (_req, res) => {
    console.log(path_1.default.resolve(__dirname, "../static/index.html"));
    res.sendFile(path_1.default.resolve(__dirname, "../static/index.html"));
});
app.use("/api/v1", router_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map