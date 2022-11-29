#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../app"));
const node_http_1 = __importDefault(require("node:http"));
const PORT = normalizePort("3000");
app_1.default.set("port", PORT);
const server = node_http_1.default.createServer(app_1.default);
server.on("error", onErrorHandler);
server.on("listening", onListeningHandler);
process.on("exit", () => server.close());
process.on("SIGTERM", () => server.close());
server.listen(PORT);
function normalizePort(port) {
    const normalizedPort = parseInt(port, 10);
    if (isNaN(normalizedPort))
        return port;
    if (normalizedPort >= 0)
        return normalizedPort;
    return false;
}
function onErrorHandler(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof PORT === "string"
        ? "Pipe " + PORT
        : "Port " + PORT;
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
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + (addr?.port || PORT);
    console.log("Listening on " + bind);
    console.log(`http://localhost:${PORT}/`);
}
//# sourceMappingURL=index.js.map