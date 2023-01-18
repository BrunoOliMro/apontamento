import { sqlConfig } from '../../global.config'
import { message } from './message';
import { select } from './select';
import { update } from './update';
import mssql from 'mssql';

export const selectToKnowIfHasP = async (obj: any) => {
    let response: any = {
        message: '',
        quantidade: obj.data.QTDE_LIB,
        childCode: [],
        condic: '',
        execut: 0,
        numeroOperNew: '',
    }
    let quantityToPoint: number;
    let numeroOperNew = String(obj.data.NUMERO_OPERACAO.replaceAll(' ', '')).replaceAll('000', '')
    obj.data.numeroOperNew = numeroOperNew
    const updateStorageQuery: any = [];
    let updateAlocacaoQuery: any = [];
    const insertAlocaoQuery: any = [];

    try {
        const resultHasP: any = await select(22, obj.data)
        console.log('result Select has P', resultHasP);

        if (resultHasP.length <= 0) {
            return response.message = message(13)
        } else if (resultHasP.length > 0) {
            let execut = Math.max(...resultHasP.map((element: any) => element.EXECUT))
            const codigoFilho: any = resultHasP.map((item: any) => item.NUMITE)
            const numberOfQtd: number = Math.min(...resultHasP.map((element: any) => element.QTD_LIBERADA_PRODUZIR))
            const makeReservation = resultHasP.map((item: any) => item.NUMSEQ).filter((element: string) => element === numeroOperNew)
            console.log('makeReservation', makeReservation);
            // Check to see if it's to make a reservation
            if (makeReservation.length <= 0) {
                return response.message = message(13)
            }

            const resultQuantityCst = await select(21, obj.data)
            console.log('resultQuantityCst', resultQuantityCst);

            // If there a values reserved
            if (resultQuantityCst.length > 0) {
                if (resultQuantityCst[0].QUANTIDADE > 0) {
                    response.quantidade = resultQuantityCst[0].QUANTIDADE;
                    response.childCode = codigoFilho;
                    response.execut = execut;
                    response.condic = 'P';
                    response.message = message(15);
                    return response;
                }
            }

            // Caso a quantidade liberada para odf seja maior ou menor que a quantidade a produzir
            if (obj.data.QTDE_LIB <= 0) {
                return response.message = message(12)
            } else if (numberOfQtd <= 0) {
                return response.message = message(12)
            } else if (obj.data.QTDE_LIB < numberOfQtd) {
                quantityToPoint = obj.data.QTDE_LIB;
            } else {
                quantityToPoint = numberOfQtd;
            }

            const quantitySetStorage = Number(quantityToPoint * execut)
            response.quantidade = quantityToPoint
            response.condic = resultHasP[0].CONDIC
            response.childCode = codigoFilho
            response.execut = execut
            obj.data.valorApontado = quantityToPoint
            obj.data.QTDE_LIB = quantityToPoint

            console.log('quantityToPoint', quantityToPoint);

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
                            updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${quantityToPoint} WHERE 1 = 1 AND ODF = '${obj.data.NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho}'`);
                        });
                        const updateAlocacao = Math.min(...await connection.query(updateAlocacaoQuery.join('\n')).then(result => result.rowsAffected));
                        if (updateAlocacao <= 0) {
                            try {
                                if (makeReservation) {
                                    codigoFilho.forEach((codigoFilho: string) => {
                                        insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES (${obj.data.NUMERO_ODF}, ${numeroOperNew}, '${obj.data.CODIGO_PECA}', '${codigoFilho}', ${quantityToPoint}, 'ADDRESS', NULL, GETDATE(), '${obj.data.FUNCIONARIO}')`);
                                    });
                                    const insertAlocacao = Math.min(...await connection.query(insertAlocaoQuery.join('\n')).then(result => result.rowsAffected));
                                    if (insertAlocacao <= 0) {
                                        response.message = message(0)
                                    } else {
                                        try {
                                            const resultUpdate = await update(5, obj.data)
                                            if (resultUpdate === message(1)) {
                                                response.message = message(14)
                                                return response
                                            } else {
                                                console.log('linha 105 /selectHAsP/');
                                                return response.message = message(0)
                                            }
                                        } catch (error) {
                                            console.log('linha 109 Error on selectHasP', error);
                                            return response.message = message(0)
                                        }
                                    }
                                }
                            } catch (error) {
                                console.log('linha 115 /selectHasP/', error);
                                return response.message = message(0)
                            }
                        } else {
                            try {
                                const resultUpdate = await update(5, obj.data)
                                if (resultUpdate === message(1)) {
                                    response.message = message(14)
                                    return response
                                } else {
                                    console.log('linha 125 /selectHAsP/');
                                    return response.message = message(0)
                                }
                            } catch (error) {
                                console.log('linha 129 Error on selectHasP', error);
                                return response.message = message(0)
                            }
                        }
                    } catch (error) {
                        console.log('linha 134 /selectHasp/', error);
                        return response.message = message(0)
                    }
                } else {
                    return response.message = message(0)
                }
            } catch (error) {
                console.log('linha 141 /selectHasP/', error);
                return response.message = message(0)
            }
        } else {
            return response.message = message(0)
        }
    } catch (error) {
        console.log('linha 148 /error: selectHasP/: ', error);
        return response.message = message(0)
    }
}