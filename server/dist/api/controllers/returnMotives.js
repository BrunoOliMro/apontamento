"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnMotives = void 0;
const global_config_1 = require("../../global.config");
const mssql_1 = __importDefault(require("mssql"));
const returnMotives = async (_req, res) => {
    const stringCallMotives = `SELECT DESCRICAO FROM MOTIVOS_DEVOLUCAO`;
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let data = await connection.query(`${stringCallMotives}`).then(record => record.recordsets);
    let response = data[0].map((element) => element.DESCRICAO);
    return res.json(response);
};
exports.returnMotives = returnMotives;
//# sourceMappingURL=returnMotives.js.map