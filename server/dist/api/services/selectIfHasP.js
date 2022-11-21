"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectToKnowIfHasP = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const selectToKnowIfHasP = async (dados) => {
    let response = {};
    try {
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        const selectKnowHasP = await connection.query(`
                    SELECT DISTINCT                 
                       OP.NUMITE,                 
                       CAST(OP.EXECUT AS INT) AS EXECUT,
                       CONDIC,       
                       CAST(E.SALDOREAL AS INT) AS SALDOREAL,                 
                       CAST(((E.SALDOREAL - ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO AND CA.ODF = PCP.NUMERO_ODF),0)) / ISNULL(OP.EXECUT,0)) AS INT) AS QTD_LIBERADA_PRODUZIR,
                       ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO),0) as saldo_alocado
                       FROM PROCESSO PRO (NOLOCK)                  
                       INNER JOIN OPERACAO OP (NOLOCK) ON OP.RECNO_PROCESSO = PRO.R_E_C_N_O_                  
                       INNER JOIN ESTOQUE E (NOLOCK) ON E.CODIGO = OP.NUMITE                
                       INNER JOIN PCP_PROGRAMACAO_PRODUCAO PCP (NOLOCK) ON PCP.CODIGO_PECA = OP.NUMPEC                
                       WHERE 1=1                    
                       AND PRO.ATIVO ='S'                   
                       AND PRO.CONCLUIDO ='T'                
                       AND OP.CONDIC ='P'                 
                       AND PCP.NUMERO_ODF = '${dados.numOdf}'    
                    `.trim()).then(result => result.recordset);
        console.log('RESOURCE: ', !selectKnowHasP);
        if (selectKnowHasP.length > 0) {
            let codigoNumite = selectKnowHasP.map(e => e.NUMITE);
            const execut = selectKnowHasP.map(item => item.EXECUT);
            const codigoFilho = selectKnowHasP.map(item => item.NUMITE);
            const qtdLibProd = selectKnowHasP.map(e => e.QTD_LIBERADA_PRODUZIR);
            const numberOfQtd = Math.min(...qtdLibProd);
            if (numberOfQtd <= 0) {
                return response = 'Quantidade para reserva inválida';
            }
            console.log("LINHA 63", numberOfQtd);
            const reservedItens = execut.map((quantItens) => {
                return Math.floor((numberOfQtd || 0) * quantItens);
            }, Infinity);
            response = {
                message: '',
                reservedItens: reservedItens,
                codigoFilho: codigoFilho,
                condic: selectKnowHasP[0].CONDIC,
                numite: codigoNumite,
            };
            const updateQtyQuery = [];
            for (const [i, qtdItem] of reservedItens.entries()) {
                console.log("i", i);
                console.log("codigo", codigoFilho[i]);
                updateQtyQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${qtdItem} WHERE 1 = 1 AND CODIGO = '${codigoFilho[i]}'`);
            }
            await connection.query(updateQtyQuery.join('\n'));
            console.log("linha 100");
            reservedItens.map((value) => {
                if (value === 0) {
                    console.log("linha 82 /selecthasP/", response);
                    return response = 'Algo deu errado';
                }
                else {
                    return response = 'Valores Reservados';
                }
            });
            console.log("linha 107", response);
        }
        else if (selectKnowHasP.length <= 0) {
            return response = "Não há item para reservar";
        }
        else {
            return response = "Algo deu errado";
        }
    }
    catch (error) {
        console.log('linha 214: ', error);
        return response = "Algo deu errado";
    }
    finally {
    }
};
exports.selectToKnowIfHasP = selectToKnowIfHasP;
//# sourceMappingURL=selectIfHasP.js.map