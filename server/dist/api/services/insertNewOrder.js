"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertIntoNewOrder = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const message_1 = require("./message");
const insertIntoNewOrder = async (variables, chosenOption) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    const codes = {
        0: `INSERT INTO NOVA_ORDEM (NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_LIB, QTDE_APONTADA, QTD_REFUGO, QTD_BOAS, QTD_RETRABALHADA, QTD_FALTANTE, CODIGO_PECA, CODIGO_CLIENTE, USUARIO, REVISAO) VALUES('${variables.cookies.NUMERO_ODF}', '${variables.cookies.NUMERO_OPERACAO}', '${variables.cookies.CODIGO_MAQUINA}', ${variables.QTDE_ODF}, ${variables.released},${variables.totalValue}, ${variables.body.badFeed || null}, ${variables.body.valorFeed || null},  ${variables.body.reworkFeed || null}, ${variables.body.missingFeed || null}, '${variables.cookies.CODIGO_PECA}', '${variables.CODIGO_CLIENTE}', '${variables.cookies.FUNCIONARIO}', '${variables.cookies.REVISAO}')`,
    };
    try {
        const data = await connection.query(`${codes[String(chosenOption)]}`).then((result) => result.recordset);
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