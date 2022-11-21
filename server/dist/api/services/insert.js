"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertInto = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const insertInto = async (funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodigoAponta, motivo, faltante, retrabalhada, tempoDecorrido) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let response = {
        message: '',
    };
    console.log("linha 10 /insert into/");
    try {
        const data = await connection.query(`INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, UPPER('${codigoPeca}'), UPPER('${revisao}'), '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, ${boas}, ${ruins}, '${funcionario}', '0', ${codAponta}, ${codAponta}, '${descricaoCodigoAponta}', ${tempoDecorrido}, ${tempoDecorrido}, '1', UPPER('${motivo}'), '${faltante}', '${retrabalhada}')`)
            .then((result) => result.rowsAffected);
        console.log("linha 14 /insert into/", data);
        if (data) {
            return response.message = "insert done";
        }
        if (!data) {
            return response.message = 'Algo deu errado';
        }
        else {
            return response.message = 'Algo deu errado';
        }
    }
    catch (err) {
        console.log("linha 22 /Error on insert into/", err);
        return response.message = 'Algo deu errado';
    }
};
exports.insertInto = insertInto;
//# sourceMappingURL=insert.js.map