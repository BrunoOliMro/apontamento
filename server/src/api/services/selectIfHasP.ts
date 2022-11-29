import { select } from './select';
import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const selectToKnowIfHasP = async (dados: any, quantidadeOdf: number, funcionario: string, numeroOperacao: string, codigoPeca: string) => {
    const connection = await mssql.connect(sqlConfig);
    let response: any = {
        message: '',
        quantidade: quantidadeOdf,
        url: '',
        reserved: [],
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
               AND OP.NUMSEQ = '${numeroOperacao}'`
        const selectKnowHasP = await select(queryStorageFund)

        //console.log("linha 48 ", x);
        if (selectKnowHasP.length > 0) {
            //const execut = selectKnowHasP.map((item: any) => item.EXECUT);
            const qtdLibProd: number[] = selectKnowHasP.map((element: any) => element.QTD_LIBERADA_PRODUZIR)
            const numberOfQtd = Math.min(...qtdLibProd)
            response.quantidade = numberOfQtd
            const codigoFilho: any = selectKnowHasP.map((item: any) => item.NUMITE)
            const updateStorageQuery = [];
            let updateAlocacaoQuery = [];
            const insertAlocaoQuery: any = [];
            response.condic = selectKnowHasP[0].CONDIC
            response.codigoFilho = codigoFilho
            let quantityToPoint: number;

            // Check to see if it's to make a reservation
            let makeReservation = selectKnowHasP.map((item: any) => item.NUMSEQ).filter((element: string) => element === numeroOperacao)
            response.reserved = makeReservation;

            if (!makeReservation) {
                return response.message = ({ message: 'Algo deu errado' })
            }

            //Retorna um array com a quantidade de itens total da execução
            // const reservedItens: number[] = execut.map((quantItens: number) => {
            //     return Math.floor((numberOfQtd || 0) * quantItens)
            // }, Infinity)

            if (numberOfQtd <= 0) {
                return response.message = 'Quantidade para reserva inválida'
            }

            // Caso a quantidade liberada para odf seja maior ou menor que a quantidade a produzir
            if (quantidadeOdf < numberOfQtd) {
                quantityToPoint = quantidadeOdf;
            } else {
                quantityToPoint = numberOfQtd;
            }

            // Loop para atualizar os dados no DB
            try {
                for (const [i] of makeReservation.length) {
                    updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${quantityToPoint} WHERE 1 = 1 AND CODIGO = '${codigoFilho[i]}'`);
                }
                let updateStorage = Math.min(...await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected));
                if (updateStorage > 0) {
                    try {
                        for (const [i] of makeReservation.length) {
                            updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${quantityToPoint} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
                        }
                        const updateAlocacao = await connection.query(updateAlocacaoQuery.join('\n')).then(result => result.rowsAffected);

                        const minValueFromUpdate = Math.min(...updateAlocacao)

                        if (minValueFromUpdate === 0) {
                            try {
                                if (makeReservation) {
                                    makeReservation.forEach((_qtdItem: number, i: number) => {
                                        insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES ('${dados.numOdf}', ${numeroOperacao}, '${codigoPeca}', '${codigoFilho[i]}', ${quantityToPoint}, 'WEUHGV', NULL, GETDATE(), '${funcionario}')`);
                                    });
                                    const insertAlocacao = Math.min(...await connection.query(insertAlocaoQuery.join('\n')).then(result => result.rowsAffected));
                                    if (insertAlocacao <= 0) {
                                        return response.message = 'Algo deu errado'
                                    } else {
                                        response.message = 'Valores Reservados'
                                        response.url = '/#/ferramenta'
                                        return response
                                    }
                                }
                            } catch (error) {
                                console.log("linha 129 /selectHasP/", error);
                                return response.message = 'Algo deu errado'
                            }
                        } else {
                            console.log("linha 134 /selectHasP/")
                            response.message = 'Valores Reservados'
                            response.url = '/#/ferramenta'
                            return response
                        }
                    } catch (error) {
                        console.log("linha 138 /selectHasp/", error);
                        return response.message = 'Algo deu errado'
                    }
                } else {
                    return response.message = 'Algo deu errado'
                }
            } catch (error) {
                console.log("linha 145 /selectHasP/", error);
                return response.message = 'Algo deu errado'
            }
        } else if (selectKnowHasP.length <= 0) {
            return response.message = "Não há item para reservar"
        } else {
            return response.message = "Algo deu errado"
        }
    } catch (error) {
        console.log('linha 154 /error: selectHasP/: ', error);
        return response.message = "Algo deu errado"
    }
}