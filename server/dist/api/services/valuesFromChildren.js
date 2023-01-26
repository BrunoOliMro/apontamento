"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChildrenValuesBack = void 0;
const global_config_1 = require("../../global.config");
const getAddress_1 = require("./getAddress");
const message_1 = require("./message");
const mssql_1 = __importDefault(require("mssql"));
const getChildrenValuesBack = async (variables, req) => {
    var returnValueAddress;
    try {
        if (!variables.cookies.childCode) {
            return { message: (0, message_1.message)(0) };
        }
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        if (variables.cookies.totalValue < Number(variables.cookies.QTDE_LIB)) {
            try {
                const updateSaldoReal = [];
                let valuesToReturnStorage = 0;
                variables.cookies.childCode.split(',').forEach((codigoFilho, i) => {
                    valuesToReturnStorage += variables.cookies.execut.split(',')[i] * Number(variables.cookies.QTDE_LIB) - variables.cookies.totalValue * variables.cookies.execut.split(',')[i];
                    const stringUpdate = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${variables.cookies.execut.split(',')[i] * Number(variables.cookies.QTDE_LIB) - variables.cookies.totalValue * variables.cookies.execut.split(',')[i]} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`;
                    updateSaldoReal.push(stringUpdate);
                });
                const insertEveryAddress = [];
                if (valuesToReturnStorage) {
                    returnValueAddress = await (0, getAddress_1.getAddress)(valuesToReturnStorage, variables, req);
                }
                variables.cookies.childCode.split(',').forEach((element, i) => {
                    insertEveryAddress.push(`INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${variables.cookies.NUMERO_ODF}', ${variables.cookies.execut.split(',')[i] * Number(variables.cookies.QTDE_LIB) - variables.cookies.totalValue * variables.cookies.execut.split(',')[i]} ,'${variables.cookies.CODIGO_PECA}', '${element}', '${returnValueAddress.address[0].ENDERECO || null}', 'DEVOLUÇÃO', '${variables.cookies.NUMERO_OPERACAO}')`);
                });
                const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
                await connection.query(updateSaldoReal.join('\n')).then(result => result.rowsAffected);
                await connection.query(insertEveryAddress.join('\n')).then(result => result.rowsAffected);
            }
            catch (error) {
                console.log('linha 36  - valuesFromChildren.ts - ', error);
                return { message: (0, message_1.message)(0) };
            }
        }
        try {
            const deleteCstAlocacao = [];
            variables.cookies.childCode.split(',').forEach((codigoFilho) => {
                const stringUpdate = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${variables.cookies.NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho}'`;
                deleteCstAlocacao.push(stringUpdate);
            });
            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
            const x = await connection.query(deleteCstAlocacao.join('\n')).then(result => result.rowsAffected);
            if (x) {
                return { returnValueAddress: returnValueAddress };
            }
            else {
                return { message: (0, message_1.message)(0) };
            }
        }
        catch (error) {
            console.log('linha 70  - valuesFromChildren.ts - ', error);
            return;
        }
        finally {
            await connection.close();
        }
    }
    catch (error) {
        console.log('linha 76  - valuesFromChildren.ts - ', error);
        return { message: (0, message_1.message)(0) };
    }
};
exports.getChildrenValuesBack = getChildrenValuesBack;
//# sourceMappingURL=valuesFromChildren.js.map