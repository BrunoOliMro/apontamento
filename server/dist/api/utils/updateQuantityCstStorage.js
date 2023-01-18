"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cstStorageUp = void 0;
const global_config_1 = require("../../global.config");
const message_1 = require("../services/message");
const update_1 = require("../services/update");
const mssql_1 = __importDefault(require("mssql"));
const query_1 = require("../services/query");
const cstStorageUp = async (QTDE_LIB, address, CODIGO_PEÇA, NUMERO_ODF, goodFeed, FUNCIONARIO, hostname, ip) => {
    const response = {
        message: '',
        address: ''
    };
    try {
        console.log('update 4 quantity', QTDE_LIB);
        console.log('update 4 address', address);
        console.log('CODIGO_PEÇA', CODIGO_PEÇA);
        const values = {
            address: address,
            partCode: CODIGO_PEÇA,
            quantityToProduce: QTDE_LIB,
        };
        const resUpdate = await (0, update_1.update)(4, values);
        console.log('resUpdate', resUpdate);
        if (resUpdate !== (0, message_1.message)(1)) {
            console.log('inserindo em CST_ESTOQUE');
            await (0, update_1.update)(6, values);
        }
        console.log("select 29");
        const resultQuery = await (0, query_1.selectQuery)(29, values);
        console.log('resultQuery', resultQuery);
        if (!resultQuery.data) {
            return (0, message_1.message)(0);
        }
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        try {
            console.log('inserindo em HISREAL', goodFeed);
            console.log('address', address);
            await connection.query(`
        INSERT INTO HISREAL
            (CODIGO, DOCUMEN, DTRECEB, QTRECEB, VALPAGO, FORMA, SALDO, DATA, LOTE, USUARIO, ODF, NOTA, LOCAL_ORIGEM, LOCAL_DESTINO, CUSTO_MEDIO, CUSTO_TOTAL, CUSTO_UNITARIO, CATEGORIA, DESCRICAO, EMPRESA_RECNO, ESTORNADO_APT_PRODUCAO, CST_ENDERECO, VERSAOSISTEMA, CST_SISTEMA,CST_HOSTNAME,CST_IP) 
        SELECT 
            CODIGO, '${NUMERO_ODF}/${CODIGO_PEÇA}', GETDATE(), ${goodFeed}, 0 , 'E', ${resultQuery.data[0].SALDO || 0} + ${goodFeed}, GETDATE(), '0', '${FUNCIONARIO}', '${NUMERO_ODF}', '0', '0', '0', 0, 0, 0, '0', 'DESCRI', 1, 'E', '${address}', 1.00, 'APONTAMENTO', '${hostname}', '${ip}'
        FROM ESTOQUE(NOLOCK)
        WHERE 1 = 1 
        AND CODIGO = '${CODIGO_PEÇA}' 
        GROUP BY CODIGO`).then(result => result.rowsAffected);
        }
        catch (error) {
            console.log('linha 194', error);
            return response.message = 'erro inserir em hisreal';
        }
        finally {
            await connection.close();
        }
    }
    catch (error) {
        console.log('Error on updating ', error);
        return (0, message_1.message)(0);
    }
};
exports.cstStorageUp = cstStorageUp;
//# sourceMappingURL=updateQuantityCstStorage.js.map