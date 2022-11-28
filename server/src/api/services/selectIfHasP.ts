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
        const queryStorageFund = `SELECT DISTINCT OP.NUMITE, OP.NUMSEQ, CAST(LTRIM(OP.NUMOPE) AS INT) AS NUMOPE CAST(OP.EXECUT AS INT) AS EXECUT,CONDIC, CAST(E.SALDOREAL AS INT) AS SALDOREAL CAST(((E.SALDOREAL - ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO AND CA.ODF = PCP.NUMERO_ODF),0)) / ISNULL(OP.EXECUT,0)) AS INT) AS QTD_LIBERADA_PRODUZIR,ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO),0) as saldo_alocadoFROM PROCESSO PRO (NOLOCK  INNER JOIN OPERACAO OP (NOLOCK) ON OP.RECNO_PROCESSO = PRO.R_E_C_N_O  INNER JOIN ESTOQUE E (NOLOCK) ON E.CODIGO = OP.NUMITINNER JOIN PCP_PROGRAMACAO_PRODUCAO PCP (NOLOCK) ON PCP.CODIGO_PECA = OP.NUMPEWHERE 1=    AND PRO.ATIVO ='S   AND PRO.CONCLUIDO ='TAND OP.CONDIC ='P AND PCP.NUMERO_ODF = '${dados.numOdf}'`
        const selectKnowHasP: any = await select(queryStorageFund)

        if (selectKnowHasP.length > 0) {
            const execut = selectKnowHasP.map((item: any) => item.EXECUT);
            const codigoFilho: any = selectKnowHasP.map((item: any) => item.NUMITE)
            const qtdLibProd: number[] = selectKnowHasP.map((element: any) => element.QTD_LIBERADA_PRODUZIR)
            const numberOfQtd = Math.min(...qtdLibProd)
            response.condic = selectKnowHasP[0].CONDIC
            response.codigoFilho = codigoFilho


            // Verificar o numero da operação onde será dado baixa na reserva
            let x = selectKnowHasP.map((item: any)=> item.NUMSEQ).some((element: any) => element === numeroOperacao)
            console.log('linha 31 /selectHasP/', x);
            if(x === true){
                console.log('linha 33 /selectHasP/ fazer reserva')
            } else {
                return response.message = 'não é nessa operação que deve ser reservado'
            }

            //Retorna um array com a quantidade de itens total da execução
            const reservedItens: any = execut.map((quantItens: any) => {
                return Math.floor((numberOfQtd || 0) * quantItens)
            }, Infinity)
            let minReserved = Math.min(...reservedItens)

            if (numberOfQtd <= 0) {
                return response.message = 'Quantidade para reserva inválida'
            }

            if (minReserved === 0) {
                return response.message = 'Algo deu errado'
            }

            if(quantidadeOdf < numberOfQtd){
                response.reserved = quantidadeOdf;
            } else {
                response.reserved = numberOfQtd;
            }


            console.log('linha 49 /selecthasP/', minReserved);
            response.quantidade = numberOfQtd
            response.reserved = reservedItens;

            const updateStorageQuery = [];
            let updateAlocacaoQuery = [];
            let updateStorage: any;
            let updateAlocacao: any;

            // Loop para atualizar os dados no DB
            try {
                for (const [i, qtdItem] of reservedItens.entries()) {
                    updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${minReserved} WHERE 1 = 1 AND CODIGO = '${codigoFilho[i]}'`);
                }
                updateStorage = Math.min(...await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected));
                //let minValueUpdateStorage = Math.min(...updateStorage)
                if (updateStorage > 0) {
                    try {
                        for (const [i, qtdItem] of reservedItens.entries()) {
                            updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${minReserved} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho[i]}'`);
                        }
                        updateAlocacao = await connection.query(updateAlocacaoQuery.join('\n')).then(result => result.rowsAffected);

                        let minValueFromUpdate = Math.min(...updateAlocacao)
                        if (minValueFromUpdate === 0) {

                            const insertAlocaoQuery: any = [];
                            let insertAlocacao;

                            try {
                                if (reservedItens) {
                                    reservedItens.forEach((qtdItem: number, i: number) => {
                                        insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES ('${dados.numOdf}', ${numeroOperacao}, '${codigoPeca}', '${codigoFilho[i]}', ${minReserved}, 'WEUHGV', NULL, GETDATE(), '${funcionario}')`);
                                    });
                                    insertAlocacao = Math.min(...await connection.query(insertAlocaoQuery.join('\n')).then(result => result.rowsAffected));
                                    //let min = Math.min(...insertAlocacao)
                                    // console.log("linha 172", min);
                                    if (insertAlocacao <= 0) {
                                        return response.message = 'Algo deu errado'
                                    } else {
                                        response.message = 'Valores Reservados'
                                        response.url = '/#/ferramenta'
                                        return response
                                    }
                                }
                            } catch (error) {
                                console.log("linha 159 /selectHasP/", error);
                                return response.message = 'Algo deu errado'
                            }
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