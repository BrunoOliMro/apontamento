"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectToKnowIfHasP = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const selectToKnowIfHasP = async (dados, quantidadeOdf) => {
    let response = {
        message: '',
        quantidade: 0,
        reserved: [],
        codigoFilho: [],
        condic: '',
    };
    try {
        const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
        console.log("linha 14", dados.numOdf);
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
        console.log('selectHasP :', selectKnowHasP);
        if (selectKnowHasP.length > 0) {
            const execut = selectKnowHasP.map(item => item.EXECUT);
            const codigoFilho = selectKnowHasP.map(item => item.NUMITE);
            response.condic = selectKnowHasP[0].CONDIC;
            response.codigoFilho = codigoFilho;
            const qtdLibProd = selectKnowHasP.map(e => e.QTD_LIBERADA_PRODUZIR);
            console.log("linha 67", qtdLibProd);
            const numberOfQtd = Math.min(...qtdLibProd);
            console.log("LINHA 63", numberOfQtd);
            if (numberOfQtd <= 0) {
                return response.message = 'Quantidade para reserva inválida';
            }
            const reservedItens = execut.map((quantItens) => {
                return Math.floor((numberOfQtd || 0) * quantItens);
            }, Infinity);
            let minReserved = Math.min(...reservedItens);
            if (minReserved === 0) {
                return response.message = 'Algo deu errado';
            }
            if (minReserved < quantidadeOdf) {
                response.quantidade = minReserved;
            }
            else if (quantidadeOdf < minReserved) {
                response.quantidade = quantidadeOdf;
            }
            response.reserved = reservedItens;
            const updateStorageQuery = [];
            const insertAlocaoQuery = [];
            let updateAlocacaoQuery = [];
            let updateStorage;
            let updateAlocacao;
            let insertAlocacao;
            try {
                for (const [i, qtdItem] of reservedItens.entries()) {
                    updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${qtdItem} WHERE 1 = 1 AND CODIGO = '${codigoFilho[i]}'`);
                }
                updateStorage = await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected);
                console.log("linha 121 /selecthasP/", updateStorage);
                let minValueUpdateStorage = Math.min(...updateStorage);
                if (minValueUpdateStorage > 0) {
                    try {
                        for (const [i, qtdItem] of reservedItens.entries()) {
                            updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
                        }
                        updateAlocacao = await connection.query(updateAlocacaoQuery.join('\n')).then(result => result.rowsAffected);
                        console.log("linha 132/selectHasP/", updateAlocacao);
                        let minValueFromUpdate = Math.min(...updateAlocacao);
                        if (minValueFromUpdate === 0) {
                            response.message = 'Rodar insert';
                            return response;
                        }
                        if (minValueFromUpdate > 0) {
                            response.message = 'Valores Reservados';
                            return response;
                        }
                    }
                    catch (error) {
                        console.log("linha 116 /selectHasp/", error);
                        return response.message = 'Algo deu errado';
                    }
                }
                else {
                    return response.message = 'Algo deu errado';
                }
            }
            catch (error) {
                console.log("linha 123 /selectHasP/", error);
                return response.message = 'Algo deu errado';
            }
        }
        else if (selectKnowHasP.length <= 0) {
            return response.message = "Não há item para reservar";
        }
        else {
            return response.message = "Algo deu errado";
        }
    }
    catch (error) {
        console.log('linha 214: ', error);
        return response.message = "Algo deu errado";
    }
};
exports.selectToKnowIfHasP = selectToKnowIfHasP;
//# sourceMappingURL=selectIfHasP.js.map