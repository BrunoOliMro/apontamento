"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectOdfFromPcp = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const selectOdfFromPcp = async (dados) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let response = {};
    const data = await connection.query(`
    SELECT 
    *
    FROM 
    VW_APP_APTO_PROGRAMACAO_PRODUCAO
    (NOLOCK)
    WHERE 1 = 1 
    AND NUMERO_ODF = '${dados.numOdf}' 
    ORDER BY NUMERO_OPERACAO ASC
    `).then((result) => result.recordset);
    if (data.length <= 0) {
        return response.message = "odf nao encontrada";
    }
    if (data.length >= 0) {
        console.log("ta aqui provavelmente /linha 24/ select from PCP /");
        return response.data = data;
    }
    else {
        return response.message = 'Algo deu errado';
    }
};
exports.selectOdfFromPcp = selectOdfFromPcp;
//# sourceMappingURL=select.js.map