"use strict";
exports.__esModule = true;
exports.sqlConfig = void 0;
require("dotenv/config");
exports.sqlConfig = {
    user: process.env["DB_USER"],
    password: process.env["DB_PWD"],
    database: process.env["DB_SCHEMA"],
    server: '192.168.100.11',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};
