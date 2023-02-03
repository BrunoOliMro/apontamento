"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChildrenValuesBack = void 0;
const global_config_1 = require("../../global.config");
const message_1 = require("./message");
const mssql_1 = __importDefault(require("mssql"));
const getChildrenValuesBack = async (variables, req) => {
    if (!variables.cookies.childCode) {
        return { message: (0, message_1.message)(0) };
    }
    var returnValueAddress;
    const updateSaldoReal = [];
    variables.cookies.childCode.split(',').forEach(async (codigoFilho, i) => {
        if (variables.cookies.totalValue < Number(variables.cookies.QTDE_LIB)) {
            const stringUpdate = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${variables.cookies.execut.split(',')[i] * Number(variables.cookies.QTDE_LIB) - variables.cookies.totalValue * variables.cookies.execut.split(',')[i]} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`;
            const inserted = `INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${variables.cookies.NUMERO_ODF}', ${variables.cookies.execut.split(',')[i] * Number(variables.cookies.QTDE_LIB) - variables.cookies.totalValue * variables.cookies.execut.split(',')[i]} ,'${variables.cookies.CODIGO_PECA}', '${codigoFilho}', '${!returnValueAddress ? (0, message_1.message)(33) : returnValueAddress.address[0].ENDERECO}', 'DEVOLUÇÃO', '${variables.cookies.NUMERO_OPERACAO}')`;
            updateSaldoReal.push(stringUpdate);
            updateSaldoReal.push(inserted);
        }
        const stringUpdate = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${variables.cookies.NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho}'`;
        updateSaldoReal.push(stringUpdate);
    });
    try {
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        await connection.query(updateSaldoReal.join('\n')).then(result => result.rowsAffected);
        return returnValueAddress || null;
    }
    catch (error) {
        console.log('linha 76  - valuesFromChildren.ts - ', error);
        return { message: (0, message_1.message)(0) };
    }
};
exports.getChildrenValuesBack = getChildrenValuesBack;
//# sourceMappingURL=valuesFromChildren.js.map