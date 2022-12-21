"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cstStorageUp = void 0;
const global_config_1 = require("../../global.config");
const select_1 = require("../services/select");
const update_1 = require("../services/update");
const mssql_1 = __importDefault(require("mssql"));
const cstStorageUp = async (quantityToProduce, address, partCode, odfNumber, goodFeed, employee, hostname, ip) => {
    const response = {
        message: '',
        address: ''
    };
    try {
        const updateStringCadEnderecos = `UPDATE CST_ESTOQUE_ENDERECOS SET QUANTIDADE = QUANTIDADE + ${quantityToProduce} WHERE 1 = 1 AND ENDERECO = '${address}'`;
        const x = await (0, update_1.update)(updateStringCadEnderecos);
        if (x !== 'Success') {
            const y = `INSERT INTO CST_ESTOQUE_ENDERECOS(ENDERECO, CODIGO ,QUANTIDADE) VALUES ('${address}','${partCode}' , ${quantityToProduce})`;
            await (0, update_1.update)(y);
        }
        const lookForHisReal = `SELECT TOP 1  * FROM HISREAL  WHERE 1 = 1 AND CODIGO = '${partCode}' ORDER BY DATA DESC`;
        const resultQuery = await (0, select_1.select)(lookForHisReal);
        if (!resultQuery) {
            return response.message = 'Algo deu errado';
        }
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        try {
            await connection.query(`
        INSERT INTO HISREAL
            (CODIGO, DOCUMEN, DTRECEB, QTRECEB, VALPAGO, FORMA, SALDO, DATA, LOTE, USUARIO, ODF, NOTA, LOCAL_ORIGEM, LOCAL_DESTINO, CUSTO_MEDIO, CUSTO_TOTAL, CUSTO_UNITARIO, CATEGORIA, DESCRICAO, EMPRESA_RECNO, ESTORNADO_APT_PRODUCAO, CST_ENDERECO, VERSAOSISTEMA, CST_SISTEMA,CST_HOSTNAME,CST_IP) 
        SELECT 
            CODIGO, '${odfNumber}/${partCode}', GETDATE(), ${goodFeed}, 0 , 'E', ${resultQuery[0].SALDO} + ${goodFeed}, GETDATE(), '0', '${employee}', '${odfNumber}', '0', '0', '0', 0, 0, 0, '0', 'DESCRI', 1, 'E', '${address}', 1.00, 'APONTAMENTO', '${hostname}', '${ip}'
        FROM ESTOQUE(NOLOCK)
        WHERE 1 = 1 
        AND CODIGO = '${partCode}' 
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
        return response.message = 'Algo deu errado';
    }
};
exports.cstStorageUp = cstStorageUp;
//# sourceMappingURL=updateQuantityCstStorage.js.map