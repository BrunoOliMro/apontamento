import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const selectToKnowIfHasP = async (dados: any, quantidadeOdf: number, funcionario: string, numeroOperacao: string, codigoPeca: string) => {
    let response = {
        message: '',
        quantidade: 0,
        reserved: [],
        codigoFilho: [],
        condic: '',
    }
    try {
        //Seleciona as peças filhas, a quantidade para execução e o estoque dos itens
        const connection = await mssql.connect(sqlConfig);
       // console.log("linha 14", dados.numOdf);
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
                    `.trim()
        ).then(result => result.recordset)
        console.log('selectHasP :', selectKnowHasP);


        if (selectKnowHasP.length > 0) {
            //Map na quantidade de itens para execução e map do estoque
            //let codigoNumite = selectKnowHasP.map(e => e.NUMITE)
            const execut = selectKnowHasP.map(item => item.EXECUT);
            //const saldoReal = selectKnowHasP.map(item => item.SALDOREAL);
            const codigoFilho: any = selectKnowHasP.map(item => item.NUMITE)


            response.condic = selectKnowHasP[0].CONDIC

            response.codigoFilho = codigoFilho

            /**
             * Calcula quantas peças pai podem ser produzidas com o estoque atual de componentes
             */
            // function calMaxQuant(qtdNecessPorPeca: number[], saldoReal: number[]): number {
            //     // Quantas peças pai o estoque do componente poderia produzir
            //     const pecasPaiPorComponente = qtdNecessPorPeca.map((qtdPorPeca, i) => {
            //         return Math.floor((saldoReal[i] || 0) / qtdPorPeca);
            //     });

            //     const qtdMaxProduzivel = pecasPaiPorComponente.reduce((qtdMax, pecasPorComp) => {
            //         return Math.min(qtdMax, pecasPorComp);
            //     }, Infinity);

            //     Math.round(qtdMaxProduzivel)
            //     return (qtdMaxProduzivel === Infinity ? 0 : qtdMaxProduzivel);
            // }

            const qtdLibProd: any = selectKnowHasP.map(element => element.QTD_LIBERADA_PRODUZIR)

            console.log("linha 67", qtdLibProd);

            const numberOfQtd = Math.min(...qtdLibProd)

            console.log("LINHA 63", numberOfQtd);

            if (numberOfQtd <= 0) {
                return response.message = 'Quantidade para reserva inválida'
            }

            //let qtdTotal = calMaxQuant(execut, saldoReal);


            //let qtdProdOdf: Number = Number(selectKnowHasP[0].QTDE_ODF)

            //let resultadoFinalProducao: Number = Number(Number(qtdTotal) - Number(qtdProdOdf))

            // if (resultadoFinalProducao <= 0) {
            //     resultadoFinalProducao = 0
            //     return resultadoFinalProducao
            // }

            //Retorna um array com a quantidade de itens total da execução
            const reservedItens: any = execut.map((quantItens) => {
                return Math.floor((numberOfQtd || 0) * quantItens)
            }, Infinity)

            let minReserved = Math.min(...reservedItens)

            if (minReserved === 0) {
                return response.message = 'Algo deu errado'
            }

            console.log('linha 102 /selectHasP/');

            if (minReserved < quantidadeOdf) {
                response.quantidade = minReserved
            } else if (quantidadeOdf < minReserved) {
                response.quantidade = quantidadeOdf
            }

            response.quantidade = numberOfQtd
            response.reserved = reservedItens;
            // response = {
            //     message: '',
            //     reservedItens: reservedItens,
            //     codigoFilho: codigoFilho,
            //     condic: selectKnowHasP[0].CONDIC,
            // }

            const updateStorageQuery = [];
            let updateAlocacaoQuery = [];
            let updateStorage: any;
            let updateAlocacao: any;

            // Loop para atualizar os dados no DB
            try {
                for (const [i, qtdItem] of reservedItens.entries()) {
                    updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${qtdItem} WHERE 1 = 1 AND CODIGO = '${codigoFilho[i]}'`);
                }
                updateStorage = await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected);
                let minValueUpdateStorage = Math.min(...updateStorage)
                if (minValueUpdateStorage > 0) {
                    try {
                        for (const [i, qtdItem] of reservedItens.entries()) {
                            updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
                        }
                        updateAlocacao = await connection.query(updateAlocacaoQuery.join('\n')).then(result => result.rowsAffected);

                        let minValueFromUpdate = Math.min(...updateAlocacao)
                        if (minValueFromUpdate === 0) {

                            const insertAlocaoQuery: any = [];
                            let insertAlocacao;

                            console.log("linha 143 /selectHasP/");
                            try {
                                if (reservedItens) {
                                    reservedItens.forEach((qtdItem: number, i: number) => {
                                        insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES ('${dados.numOdf}', ${numeroOperacao}, '${codigoPeca}', '${codigoFilho[i]}', ${qtdItem}, 'WEUHGV', NULL, GETDATE(), '${funcionario}')`);
                                    });
                                    insertAlocacao = await connection.query(insertAlocaoQuery.join('\n')).then(result => result.rowsAffected);
                                    let min = Math.min(...insertAlocacao)
                                    console.log("linha 172", min);
                                    if (min <= 0) {
                                        return response.message = 'Algo deu errado'
                                    } else {
                                        response.message = 'Valores Reservados'
                                        return response
                                    }
                                }
                            } catch (error) {
                                console.log("linha 159 /selectHasP/", error);
                                return response.message = 'Algo deu errado'
                            }

                            // response.message = 'Rodar insert'
                            // return response
                        }
                        if (minValueFromUpdate > 0) {
                            response.message = 'Valores Reservados'
                            return response
                        }
                    } catch (error) {
                        console.log("linha 116 /selectHasp/", error);
                        return response.message = 'Algo deu errado'
                    }
                } else {
                    return response.message = 'Algo deu errado'
                }
            } catch (error) {
                console.log("linha 123 /selectHasP/", error);
                return response.message = 'Algo deu errado'
            }

            // if (updateStorage === 'Deu certo') {
            //     try {
            //         for (const [i, qtdItem] of reservedItens.entries()) {
            //             updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${qtdItem} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
            //         }
            //         updateAlocacao = await connection.query(updateAlocacaoQuery.join('\n'));
            //         console.log("linha 117 / selecthasP /", updateAlocacao);
            //         if (!updateAlocacao) {
            //             return response.message = 'Rodar insert'
            //         }
            //     } catch (error) {
            //         console.log("linha 119 /selectHasp/");
            //         return response.message = 'Algo deu errado'
            //     }
            // } else {
            //     return response.message = 'Algo deu errado'
            // }


            // if (!updateAlocacao) {
            //     try {
            //         for (const [i, qtdItem] of reservedItens.entries()) {
            //             insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES ('${dados.numOdf}', 40, '105831437', '${codigoFilho[i]}', ${qtdItem}, 'WEUHGV', NULL, GETDATE(), 'CESAR')`)
            //         }
            //         insertAlocacao = await connection.query(insertAlocaoQuery.join('\n'));
            //     } catch (error) {
            //         console.log("linha 136 /selectHasP/", error);
            //         return response.message = 'Algo deu errado'
            //     }
            // }

            // if (updateStorage.length > 0 && updateAlocacao.length > 0) {
            //     let obj = {
            //         message: 'Valores Reservados',
            //         reservedItens: reservedItens,
            //         codigoFilho: codigoFilho,
            //         condic: selectKnowHasP[0].CONDIC,
            //     }

            //     return obj
            // } else {
            //     return response.message = 'Algo deu errado'
            // }
        } else if (selectKnowHasP.length <= 0) {
            return response.message = "Não há item para reservar"
        } else {
            return response.message = "Algo deu errado"
        }
    } catch (error) {
        console.log('linha 235 /error: selectHasP/: ', error);
        return response.message = "Algo deu errado"
    }
}