import { select } from './select';
import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const selectToKnowIfHasP = async (dados: any, quantidadeOdf: number, funcionario: string, numeroOperacao: string, codigoPeca: string) => {
    const connection = await mssql.connect(sqlConfig);
    let response: any = {
        message: '',
        quantidade: quantidadeOdf,
        url: '',
        codigoFilho: [],
        condic: '',
    }

    try {
        //Seleciona as peças filhas, a quantidade para execução e o estoque dos itens
        const queryStorageFund = `SELECT DISTINCT                 
        OP.NUMITE,
        OP.NUMSEQ,
        CAST(LTRIM(OP.NUMOPE) AS INT) AS NUMOPE,
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
               AND OP.NUMSEQ = ${numeroOperacao}`
        const selectKnowHasP = await select(queryStorageFund)

        console.log("linha 39 /selectKnowHasP/ ", selectKnowHasP);
        if (selectKnowHasP.length > 0) {
            const qtdLibProd: number[] = selectKnowHasP.map((element: any) => element.QTD_LIBERADA_PRODUZIR)
            const numberOfQtd = Math.min(...qtdLibProd)

            response.quantidade = numberOfQtd
            const codigoFilho: any = selectKnowHasP.map((item: any) => item.NUMITE)
            const updateStorageQuery: any = [];
            let updateAlocacaoQuery: any = [];
            const insertAlocaoQuery: any = [];
            response.condic = selectKnowHasP[0].CONDIC
            response.codigoFilho = codigoFilho
            let quantityToPoint: number;

            // Check to see if it's to make a reservation
            // let makeReservation = selectKnowHasP.map((item: any) => item.NUMSEQ).filter((element: string) => element === numeroOperacao)
            //response.reserved = makeReservation;
            let x = String(numeroOperacao.replaceAll(' ', ''))
            let makeReservation = selectKnowHasP.map((item: any) => item.NUMSEQ).filter((element: string) => element === x)

            if (makeReservation.length <= 0) {
                response.message = 'Algo deu errado'
                return response
            }

            //Retorna um array com a quantidade de itens total da execução
            // const reservedItens: number[] = execut.map((quantItens: number) => {
            //     return Math.floor((numberOfQtd || 0) * quantItens)
            // }, Infinity)

            if (numberOfQtd <= 0) {
                response.message = 'Quantidade para reserva inválida'
                return response
            }

            console.log('linha 74 /SelectHasP - numberOfQtd/', numberOfQtd);
            console.log("linha 75 /selectHasP/quantidade", quantidadeOdf);

            // Caso a quantidade liberada para odf seja maior ou menor que a quantidade a produzir
            if (quantidadeOdf < numberOfQtd) {
                response.quantidade = quantidadeOdf
                quantityToPoint = quantidadeOdf;
            } else {
                response.quantidade = numberOfQtd
                quantityToPoint = numberOfQtd;
            }


            response.quantidade

            console.log('linha 83', quantityToPoint);


            // Loop para atualizar os dados no DB
            try {
                codigoFilho.forEach((element: string) => {
                    updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${quantityToPoint} WHERE 1 = 1 AND CODIGO = '${element}'`);
                });
                let updateStorage = Math.min(...await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected));
                if (updateStorage > 0) {
                    try {
                        codigoFilho.forEach((codigoFilho: string) => {
                            updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${quantityToPoint} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho}'`);
                        });
                        const updateAlocacao = Math.min(...await connection.query(updateAlocacaoQuery.join('\n')).then(result => result.rowsAffected));
                        if (updateAlocacao === 0) {
                            try {
                                if (makeReservation) {
                                    codigoFilho.forEach((codigoFilho: string) => {
                                        insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES (${dados.numOdf}, ${numeroOperacao}, '${codigoPeca}', '${codigoFilho}', ${quantityToPoint}, 'ADDRESS', NULL, GETDATE(), '${funcionario}')`);
                                    });
                                    const insertAlocacao = Math.min(...await connection.query(insertAlocaoQuery.join('\n')).then(result => result.rowsAffected));
                                    if (insertAlocacao <= 0) {
                                        response.message = 'Algo deu errado'
                                        return response
                                    } else {
                                        console.log("linha 103", insertAlocacao);
                                        response.message = 'Valores Reservados'
                                        response.url = '/#/ferramenta'
                                        return response
                                    }
                                }
                            } catch (error) {
                                console.log("linha 129 /selectHasP/", error);
                                response.message = 'Algo deu errado'
                                return response
                            }
                        } else {
                            console.log("linha 134 /selectHasP/")
                            response.message = 'Valores Reservados'
                            response.url = '/#/ferramenta'
                            return response
                        }
                    } catch (error) {
                        console.log("linha 138 /selectHasp/", error);
                        response.message = 'Algo deu errado'
                        return response
                    }
                } else {
                    response.message = 'Algo deu errado'
                    return response
                }
            } catch (error) {
                console.log("linha 145 /selectHasP/", error);
                response.message = 'Algo deu errado'
                return response
            }
        } else if (selectKnowHasP.length <= 0) {
            response.message = "Não há item para reservar"
            return response
        } else {
            response.message = "Algo deu errado"
            return response
        }
    } catch (error) {
        console.log('linha 154 /error: selectHasP/: ', error);
        return response.message = "Algo deu errado"
    }
}