"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertIntoNewOrder = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const insertIntoNewOrder = async (string) => {
    let response = {
        message: '',
    };
    try {
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        const data = await connection.query(`${string}`).then((result) => result.recordset);
        return data;
    }
    catch (error) {
        console.log('linha 13 /Error on insert into new Order/', error);
        return response.message = 'Algo deu errado';
    }
};
exports.insertIntoNewOrder = insertIntoNewOrder;
//# sourceMappingURL=insertNewOrder.js.map