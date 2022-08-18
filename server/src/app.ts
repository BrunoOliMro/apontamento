// import "dotenv/config";
import express from "express";
import path from "path";

import apiRouter from "./api/router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));

// Middleware de log
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.baseUrl}${req.path}`);
    console.log("Body: ", req.body);
    next();
});

app.get("/", (_req, res) => {
    console.log(path.resolve(__dirname, "../static/index.html"));
    res.sendFile(path.resolve(__dirname, "../static/index.html"));
});

app.use("/api/v1", apiRouter);

export default app;