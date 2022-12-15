import { select } from './select';
import mssql from 'mssql';
import { sqlConfig } from '../../global.config'
import { update } from './update';

export const selectToKnowIfHasP = async (dados: any, quantidadeOdf: number, funcionario: string, numeroOperacao: string, codigoPeca: string, revisao: number) => {
    let response: any = {
        message: '',
        quantidade: quantidadeOdf,
        codigoFilho: [],
        condic: '',
        execut: 0,
    }
    let quantityToPoint: number;
    let numeroOperNew = String(numeroOperacao.replaceAll(' ', ''))
    const updateStorageQuery: any = [];
    let updateAlocacaoQuery: any = [];
    const insertAlocaoQuery: any = [];
    const queryStorageFund = `SELECT DISTINCT  
    PCP.NUMERO_ODF,
    OP.STATUS_RESERVA,
    OP.NUMITE,
    OP.NUMSEQ,
    CAST(LTRIM(OP.NUMOPE) AS INT) AS NUMOPE,
           CAST(OP.EXECUT AS INT) AS EXECUT,
           CONDIC,       
           CAST(E.SALDOREAL AS INT) AS SALDOREAL,                 
           CAST(((E.SALDOREAL - ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO AND CA.ODF = PCP.NUMERO_ODF),0)) / ISNULL(OP.EXECUT,0)) AS INT) AS QTD_LIBERADA_PRODUZIR,
           ISNULL((SELECT ISNULL(SUM(QUANTIDADE),0) FROM CST_ALOCACAO CA (NOLOCK) WHERE CA.CODIGO_FILHO = E.CODIGO),0) as RESERVADO
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

    try {
        const selectKnowHasP = await select(queryStorageFund)

        if (selectKnowHasP.length <= 0) {
            return response.message = "Não há item para reservar"
        } else if (selectKnowHasP.length > 0) {
            let execut = Math.max(...selectKnowHasP.map((element: any) => element.EXECUT))
            const codigoFilho: any = selectKnowHasP.map((item: any) => item.NUMITE)
            const numberOfQtd: number = Math.min(...selectKnowHasP.map((element: any) => element.QTD_LIBERADA_PRODUZIR))
            const makeReservation = selectKnowHasP.map((item: any) => item.NUMSEQ).filter((element: string) => element === numeroOperNew)

            // Check to see if it's to make a reservation
            if (makeReservation.length <= 0) {
                return response.message = 'Não há item para reservar'
            }

            if (selectKnowHasP[0].hasOwnProperty('STATUS_RESERVA')) {
                if (selectKnowHasP[0].STATUS_RESERVA === `${dados.numOdf}`) {
                    response.quantidade = selectKnowHasP[0].RESERVADO
                    response.codigoFilho = codigoFilho
                    response.execut = execut
                    response.condic = 'P'
                    response.message = 'Gerar cookies'
                    return response
                }
            }


            console.log('linha 68 /SelectHas/', numberOfQtd);
            console.log('linha 68 /SelectHas/', quantidadeOdf);

            // Caso a quantidade liberada para odf seja maior ou menor que a quantidade a produzir
            if (quantidadeOdf <= 0) {
                return response.message = 'Quantidade para reserva inválida'
            } else if (numberOfQtd <= 0) {
                return response.message = 'Quantidade para reserva inválida'
            } else if (quantidadeOdf < numberOfQtd) {
                quantityToPoint = quantidadeOdf;
            } else {
                quantityToPoint = numberOfQtd;
            }

            const quantitySetStorage = quantityToPoint * execut
            response.quantidade = quantityToPoint
            response.condic = selectKnowHasP[0].CONDIC
            response.codigoFilho = codigoFilho
            response.execut = execut

            // Loop para atualizar os dados no DB
            try {
                codigoFilho.forEach((element: string) => {
                    updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${quantitySetStorage} WHERE 1 = 1 AND CODIGO = '${element}'`);
                });
                const connection = await mssql.connect(sqlConfig);
                let updateStorage = Math.min(...await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected));
                if (updateStorage > 0) {
                    try {
                        codigoFilho.forEach((codigoFilho: string) => {
                            updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${quantityToPoint} WHERE 1 = 1 AND ODF = '${dados.numOdf}' AND CODIGO_FILHO = '${codigoFilho}'`);
                        });
                        const updateAlocacao = Math.min(...await connection.query(updateAlocacaoQuery.join('\n')).then(result => result.rowsAffected));
                        if (updateAlocacao <= 0) {
                            try {
                                if (makeReservation) {
                                    codigoFilho.forEach((codigoFilho: string) => {
                                        insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES (${dados.numOdf}, ${numeroOperNew}, '${codigoPeca}', '${codigoFilho}', ${quantityToPoint}, 'ADDRESS', NULL, GETDATE(), '${funcionario}')`);
                                    });
                                    const insertAlocacao = Math.min(...await connection.query(insertAlocaoQuery.join('\n')).then(result => result.rowsAffected));
                                    if (insertAlocacao <= 0) {
                                        response.message = 'Algo deu errado'
                                    } else {
                                        try {
                                            let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${quantityToPoint} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${numeroOperNew}`
                                            const x = await update(y)
                                            if (x === 'Update sucess') {
                                                let p: any = []
                                                codigoFilho.forEach((element: any) => {
                                                    const z = `UPDATE OPERACAO SET STATUS_RESERVA = TRIM('R') WHERE 1 = 1 AND NUMPEC = TRIM('${codigoPeca}') AND NUMITE = '${element}' AND REVISAO = ${revisao}`
                                                    p.push(z)
                                                });
                                                const w = await connection.query(p.join('\n')).then(result => result.rowsAffected)
                                                if (w) {
                                                    response.message = 'Valores Reservados'
                                                    response.url = '/#/ferramenta'
                                                    return response
                                                } else {
                                                    return response.message = 'Status da reserva não foi atualizado'
                                                }
                                            } else {
                                                console.log('linha 112 /selectHAsP/');
                                                return response.message = 'Algo deu errado'
                                            }
                                        } catch (error) {
                                            console.log('linha 116 Error on selectHasP', error);
                                            return response.message = 'Algo deu errado'
                                        }
                                    }
                                }
                            } catch (error) {
                                console.log("linha 122 /selectHasP/", error);
                                return response.message = 'Algo deu errado'
                            }
                        } else {
                            try {
                                let y = `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${quantityToPoint} WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${numeroOperNew}`
                                const x = await update(y)
                                if (x === 'Update sucess') {
                                    let p: any = []
                                    codigoFilho.forEach((element: any) => {
                                        const z = `UPDATE OPERACAO SET STATUS_RESERVA = TRIM('R') WHERE 1 = 1 AND NUMPEC = TRIM('${codigoPeca}') AND NUMITE = '${element}' AND REVISAO = ${revisao}`
                                        p.push(z)
                                    });
                                    const w = await connection.query(p.join('\n')).then(result => result.rowsAffected)
                                    if (w) {
                                        response.message = 'Valores Reservados'
                                        response.url = '/#/ferramenta'
                                        return response
                                    } else {
                                        return response.message = 'Status da reserva não foi atualizado'
                                    }
                                } else {
                                    console.log('linha 112 /selectHAsP/');
                                    return response.message = 'Algo deu errado'
                                }
                            } catch (error) {
                                console.log('linha 116 Error on selectHasP', error);
                                return response.message = 'Algo deu errado'
                            }
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
        } else {
            return response.message = 'Algo deu errado'
        }
    } catch (error) {
        console.log('linha 154 /error: selectHasP/: ', error);
        return response.message = "Algo deu errado"
    }
}