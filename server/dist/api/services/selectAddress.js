"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectAddress = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const message_1 = require("./message");
const selectAddress = async (condicional, percentage, comprimento, largura, peso) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    try {
        const data = await connection.query(`
        SELECT TOP 1
        EE.CODIGO AS COD_PRODUTO,
        NULL AS COD_PRODUTO_EST, 
        CE.CODIGO,
        CE.ENDERECO, 
        ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
        FROM CST_CAD_ENDERECOS CE(NOLOCK)
        LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
        WHERE ISNULL(EE.QUANTIDADE,0) <= 0 AND CE.ENDERECO LIKE '${percentage}%' AND UPPER(EE.CODIGO) ${condicional} AND CE.COMPRIMENTO > ${comprimento} AND CE.LARGURA > ${largura} AND CE.PESO > ${peso} ORDER BY CE.ENDERECO ASC`).then((result) => result.recordset);
        if (data.length > 0) {
            return data;
        }
        else {
            return (0, message_1.message)(17);
        }
    }
    catch (error) {
        console.log('Error on selecting Address', error);
        return (0, message_1.message)(33);
    }
    finally {
        await connection.close();
    }
};
exports.selectAddress = selectAddress;
//# sourceMappingURL=selectAddress.js.map