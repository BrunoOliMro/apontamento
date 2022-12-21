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
    let response = {
        message: '',
    };
    const data = await connection.query(`${query}`).then((result) => result.rowsAffected);
    console.log('linha 10 /Data -- Update --/ ', data[0]);
    if (data[0] > 0) {
        console.log('SUCESSO');
        return response.message = "Success";
    }
    else {
        console.log('ERROR');
        return response.message = "Error";
    }
};
exports.update = update;
//# sourceMappingURL=update.js.map