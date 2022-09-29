#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("../app");
var node_http_1 = require("node:http");
var PORT = normalizePort(process.env["PORT"] || "3000");
app_1.default.set("port", PORT);
var server = node_http_1.default.createServer(app_1.default);
server.on("error", onErrorHandler);
server.on("listening", onListeningHandler);
process.on("exit", function () { return server.close(); });
process.on("uncaughtException", function () { return server.close(); });
process.on("unhandledRejection", function () { return server.close(); });
process.on("SIGTERM", function () { return server.close(); });
server.listen(PORT);
// --- 
function normalizePort(port) {
    var normalizedPort = parseInt(port, 10);
    if (isNaN(normalizedPort))
        return port; // named pipe 
    if (normalizedPort >= 0)
        return normalizedPort; // port number 
    return false;
}
function onErrorHandler(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    var bind = typeof PORT === "string"
        ? "Pipe " + PORT
        : "Port " + PORT;
    // handle specific listen errors with friendly messages 
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function onListeningHandler() {
    var addr = server.address();
    var bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + ((addr === null || addr === void 0 ? void 0 : addr.port) || PORT);
    console.log("Listening on " + bind);
    console.log("http://localhost:".concat(PORT, "/"));
}
//# sourceMappingURL=index.js.map