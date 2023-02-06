"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertInto = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const message_1 = require("./message");
const insertInto = async (funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoFilho, i) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const data = await connection.query(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES (${numeroOdf}, ${numeroOperacao}, '${codigoPeca}', '${codigoFilho[i]}', ${revisao}, 'ADDRESS', NULL, GETDATE(), '${funcionario}')`).then((result) => result.rowsAffected);
        if (data) {
            return (0, message_1.message)(35);
        }
        else {
            return (0, message_1.message)(17);
        }
    }
    catch (error) {
        console.log('linha 22 /Error on insert into/', error);
        return (0, message_1.message)(33);
    }
};
exports.insertInto = insertInto;
//# sourceMappingURL=insertCst.js.map