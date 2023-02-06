// import "dotenv/config";
import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import apiRouter from "./api/router";
import cors from "cors";
import { poolConnection } from "./queryConnector";


const app = express();
app.use(express.json({ limit: '0.20kb' })); // Here input body limit is 20 kb
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));
app.use(cors({credentials: true, origin: ['http://localhost:3000', 'http://192.168.97.108:3000' ]}))
poolConnection()
// app.use(poolConnection)

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