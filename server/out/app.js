"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import "dotenv/config";
var path_1 = require("path");
var express_1 = require("express");
var cookie_parser_1 = require("cookie-parser");
var router_1 = require("./api/router");
var app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("static"));
// Middleware de log
app.use(function (req, _res, next) {
    console.log("".concat(req.method, " ").concat(req.baseUrl).concat(req.path));
    console.log("Body: ", req.body);
    next();
});
app.get("/", function (_req, res) {
    console.log(path_1.default.resolve(__dirname, "../static/index.html"));
    res.sendFile(path_1.default.resolve(__dirname, "../static/index.html"));
});
app.use("/api/v1", router_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map