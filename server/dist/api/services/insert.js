"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertInto = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const message_1 = require("./message");
const insertInto = async (obj) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const data = [];
        obj.pointedCode.forEach((element, i) => {
            console.log('element', element);
            let string = `INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) VALUES (GETDATE(), '${obj.FUNCIONARIO}', ${obj.NUMERO_ODF}, UPPER('${obj.CODIGO_PECA}'), UPPER('${obj.REVISAO}'), '${obj.NUMERO_OPERACAO}', '${obj.NUMERO_OPERACAO}', 'D', '${obj.CODIGO_MAQUINA}', ${obj.QTDE_LIB}, ${obj.goodFeed || null}, ${obj.badFeed || null}, '${obj.FUNCIONARIO}', '0', ${element}, ${element}, '${obj.pointedCodeDescription[i]}', ${obj.tempoDecorrido || null}, ${obj.tempoDecorrido || null}, '1', UPPER('${obj.motives || null}'), ${obj.missingFeed || null}, ${obj.reworkFeed || null})`;
            data.push(string);
        });
        const resultInsert = await connection.query(data.join("\n")).then(result => result.rowsAffected);
        if (resultInsert) {
            return (0, message_1.message)(1);
        }
        else {
            return (0, message_1.message)(17);
        }
    }
    catch (err) {
        console.log('linha 25 /Error on insert into/', err);
        return (0, message_1.message)(33);
    }
    finally {
        await connection.close();
    }
};
exports.insertInto = insertInto;
//# sourceMappingURL=insert.js.map