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
const cstStorageUp = async (QTDE_LIB, address, CODIGO_PEÇA, NUMERO_ODF, goodFeed, FUNCIONARIO, hostname, ip, codigoFilho) => {
    const response = {
        message: '',
        address: ''
    };
    try {
        const values = {
            address: address,
            partCode: CODIGO_PEÇA,
            quantityToProduce: QTDE_LIB,
        };
        const resUpdate = await (0, update_1.update)(4, values);
        if (resUpdate !== (0, message_1.message)(1)) {
            const z = [];
            codigoFilho.forEach(element => {
                console.log('CST ESTOQUE - ', element);
                z.push(`INSERT INTO CST_ESTOQUE_ENDERECOS (CODIGO, ENDERECO, QUANTIDADE, ODF, DATAHORA) VALUES ('${element}',  '${address}',  ${QTDE_LIB}, ${NUMERO_ODF}, GETDATE())`);
            });
            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
            await connection.query(z.join('\n')).then(result => result.rowsAffected);
        }
        const resultQuery = await (0, query_1.selectQuery)(29, values);
        if (!resultQuery.data) {
            return (0, message_1.message)(0);
        }
        try {
            const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
            await connection.query(`
        INSERT INTO HISREAL
            (CODIGO, DOCUMEN, DTRECEB, QTRECEB, VALPAGO, FORMA, SALDO, DATA, LOTE, USUARIO, ODF, NOTA, LOCAL_ORIGEM, LOCAL_DESTINO, CUSTO_MEDIO, CUSTO_TOTAL, CUSTO_UNITARIO, CATEGORIA, DESCRICAO, EMPRESA_RECNO, ESTORNADO_APT_PRODUCAO, CST_ENDERECO, VERSAOSISTEMA, CST_SISTEMA,CST_HOSTNAME,CST_IP) 
        SELECT 
            CODIGO, '${NUMERO_ODF}/${CODIGO_PEÇA}', GETDATE(), ${goodFeed}, 0 , 'E', ${resultQuery.data[0].SALDO || 0} + ${goodFeed}, GETDATE(), '0', '${FUNCIONARIO}', '${NUMERO_ODF}', '0', '0', '0', 0, 0, 0, '0', 'DESCRI', 1, 'E', '${address}', 1.00, 'APONTAMENTO', '${hostname}', '${ip}'
        FROM ESTOQUE(NOLOCK)
        WHERE 1 = 1 
        AND CODIGO = '${CODIGO_PEÇA}' 
        GROUP BY CODIGO`).then(result => result.rowsAffected);
            await connection.close();
        }
        catch (error) {
            console.log('linha 194', error);
            return response.message = 'erro inserir em hisreal';
        }
    }
    catch (error) {
        console.log('Error on updating ', error);
        return (0, message_1.message)(0);
    }
};
exports.cstStorageUp = cstStorageUp;
//# sourceMappingURL=updateQuantityCstStorage.js.map