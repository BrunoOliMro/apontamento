"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertIntoNewOrder = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const message_1 = require("./message");
const insertIntoNewOrder = async (string) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const data = await connection.query(`${string}`).then((result) => result.recordset);
        if (data) {
            return data;
        }
        else {
            return (0, message_1.message)(17);
        }
    }
    catch (error) {
        console.log('linha 13 /Error on insert into new Order/', error);
        return (0, message_1.message)(33);
    }
    finally {
        await connection.close();
    }
};
exports.insertIntoNewOrder = insertIntoNewOrder;
//# sourceMappingURL=insertNewOrder.js.map