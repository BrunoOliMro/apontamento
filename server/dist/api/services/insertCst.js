"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertInto = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const insertInto = async (funcionario, numeroOdf, codigoPeca, numeroOperacao, codigoFilho, i, revisao) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let response = {
        message: '',
    };
    try {
        const data = await connection.query(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES ('${numeroOdf}', ${numeroOperacao}, '${codigoPeca}', '${codigoFilho[i]}', ${revisao}, 'ADDRESS', NULL, GETDATE(), '${funcionario}')`)
            .then((result) => result.rowsAffected);
        console.log("insert into -");
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
//# sourceMappingURL=insertCst.js.map