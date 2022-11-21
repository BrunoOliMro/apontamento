"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const update = async (query) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let response = {};
    const data = await connection.query(`${query}`).then((result) => result.recordset);
    if (data.length <= 0) {
        return response.message = "Error on update";
    }
    if (data.length >= 0) {
        return response.message = "Update sucess";
    }
    else {
        return response.message = 'Algo deu errado';
    }
};
exports.update = update;
//# sourceMappingURL=update.js.map