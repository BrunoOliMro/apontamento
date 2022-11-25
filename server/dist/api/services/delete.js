"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuery = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const deleteQuery = async (query) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    const data = await connection.query(`${query}`).then((result) => result.recordset);
    return data;
};
exports.deleteQuery = deleteQuery;
//# sourceMappingURL=delete.js.map