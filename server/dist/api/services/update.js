"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const global_config_1 = require("../../global.config");
const message_1 = require("./message");
const mssql_1 = __importDefault(require("mssql"));
const update = async (chosenOption, values) => {
    if (!values) {
        values = {};
    }
    else if (!chosenOption) {
        chosenOption = 0;
    }
    const codes = {
        0: `UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${values.NUMERO_OPERACAO} AND CODIGO_MAQUINA = '${values.CODIGO_MAQUINA}'`,
        1: `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${values.QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF} AND NUMERO_OPERACAO = ${values.NUMERO_OPERACAO}`,
        2: `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA =  ${values.valorApontado}, QTD_BOAS = QTD_BOAS - ${values.goodFeed}, QTD_FALTANTE = COALESCE(QTD_FALTANTE, 0) + ${values.missingFeed}, QTDE_LIB = ${values.QTDE_LIB}, QTD_REFUGO = QTD_REFUGO - ${values.badFeed}, QTD_ESTORNADA = COALESCE(QTD_ESTORNADA, 0 ) + ${values.valorTotal} WHERE 1 = 1 AND NUMERO_ODF = '${values.NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${Number(values.NUMERO_OPERACAO)} AND CODIGO_MAQUINA = '${values.CODIGO_MAQUINA}'`,
        3: `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = COALESCE(QTDE_APONTADA, 0) + ${values.valorApontado || 0}, QTD_REFUGO = COALESCE(QTD_REFUGO, 0) + ${values.badFeed || 0}, QTDE_LIB = ${values.released || 0}, QTD_FALTANTE = COALESCE(QTD_FALTANTE, 0) + ${values.missingFeed || 0}, QTD_BOAS = COALESCE(QTD_BOAS, 0) + ${values.valorFeed || 0}, QTD_RETRABALHADA = COALESCE(QTD_RETRABALHADA, 0) + ${values.reworkFeed || 0} WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF || null} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${values.NUMERO_OPERACAO || null} AND CODIGO_MAQUINA = '${values.CODIGO_MAQUINA || null}'`,
        4: `UPDATE CST_ESTOQUE_ENDERECOS SET QUANTIDADE = COALESCE(QUANTIDADE, 0) + ${values.quantityToProduce}, DATAHORA = GETDATE() WHERE 1 = 1 AND ENDERECO = '${values.address}'`,
        5: `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${values.QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = '${values.NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${Number(values.NUMERO_OPERACAO)}' AND CODIGO_MAQUINA = '${values.CODIGO_MAQUINA}'`,
    };
    try {
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        const data = await connection.query(`${codes[String(chosenOption)]}`).then((result) => result.rowsAffected);
        await connection.close();
        return data;
    }
    catch (error) {
        console.log('Error on Update', error);
        return (0, message_1.message)(33);
    }
};
exports.update = update;
//# sourceMappingURL=update.js.map