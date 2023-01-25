import { sqlConfig } from '../../global.config'
import { selectQuery } from './query';
import { message } from './message';
import { update } from './update';
import mssql from 'mssql';

export const selectToKnowIfHasP = async (obj: { message?: string; data: { [key: string]: any } }) => {
    let response: any = {
        message: '',
        quantidade: obj.data['QTDE_LIB'],
        childCode: [],
        condic: '',
        execut: [],
        numeroOperNew: '',
    }

    const resultHasP: any = await selectQuery(22, obj.data)
    if (resultHasP.data!.length <= 0) {
        return response.message = message(13)
    } else if (resultHasP.data!.length > 0) {
        const execut = resultHasP.data!.map((element: any) => element.EXECUT)
        const codigoFilho: string[] = resultHasP.data!.map((item: any) => item.NUMITE)
        const minQtdAllowed: number = Math.min(...resultHasP.data!.map((element: any) => element.QTD_LIBERADA_PRODUZIR))
        const processItens = resultHasP.data!.map((item: any) => item.NUMSEQ).filter((element: string) => element === String(String(obj.data['NUMERO_OPERACAO']!).replaceAll(' ', '')).replaceAll('000', ''))
        const minToProd: number = minQtdAllowed < obj.data['QTDE_LIB']! ? minQtdAllowed : Number(obj.data!['QTDE_LIB']);
        const resultQuantityCst = await selectQuery(21, obj.data)

        // If there a values reserved
        if (resultQuantityCst.data![0]) {
            if (resultQuantityCst.data![0].hasOwnProperty('QUANTIDADE')) {
                if (resultQuantityCst.data![0].QUANTIDADE > 0) {
                    response.execut = execut;
                    response.condic = 'P';
                    obj.data['valorApontado'] = minToProd
                    obj.data['QTDE_LIB'] = minToProd
                    response.childCode = codigoFilho
                    response.quantidade = minToProd
                    response.message = message(15);
                    return response;
                }
            }
        }

        if (!minToProd || minToProd <= 0) {
            return response = message(12)
        }

        // Check to see if it's to make a reservation
        if (processItens.length <= 0) {
            return response.message = message(13)
        }

        // Loop para atualizar os dados no DB
        try {
            const updateAlocacaoQuery: string[] = [];
            const insertAlocaoQuery: string[] = [];
            const updateStorageQuery: string[] = [];
            const insertAddressUpdate: string[] = [];

            const connection = await mssql.connect(sqlConfig);
            codigoFilho.forEach((element) => {
                insertAddressUpdate.push(`INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${obj.data['NUMERO_ODF']}', ${minToProd} ,'${obj.data['CODIGO_PECA']}', '${element}', '${ '999' + element}', 'RESERVA', '${obj.data['NUMERO_OPERACAO']!.replaceAll('000', '')}')`)
            })
            await connection.query(insertAddressUpdate.join('\n')).then(result => result.rowsAffected)


            codigoFilho.forEach((element: string, i: number) => {
                updateStorageQuery.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${minToProd * execut[i]} WHERE 1 = 1 AND CODIGO = '${element}'`);
            });
            let updateStorage = Math.min(...await connection.query(updateStorageQuery.join('\n')).then(result => result.rowsAffected));
            if (updateStorage > 0) {
                try {
                    codigoFilho.forEach((codigoFilho: string, i: number) => {
                        updateAlocacaoQuery.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${minToProd * execut[i]} WHERE 1 = 1 AND ODF = '${obj.data['NUMERO_ODF']}' AND CODIGO_FILHO = '${codigoFilho}'`);
                    });
                    const updateAlocacao = Math.min(...await connection.query(updateAlocacaoQuery.join('\n')).then(result => result.rowsAffected));
                    if (updateAlocacao <= 0) {
                        try {
                            if (processItens) {
                                codigoFilho.forEach((codigoFilho: string, i: number) => {
                                    insertAlocaoQuery.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES (${obj.data['NUMERO_ODF']}, ${String(String(obj.data['NUMERO_OPERACAO']!).replaceAll(' ', '')).replaceAll('000', '')}, '${obj.data['CODIGO_PECA']}', '${codigoFilho}', ${minToProd * execut[i]}, 'ADDRESS', NULL, GETDATE(), '${obj.data['FUNCIONARIO']}')`);
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
        } finally {
            response.condic = resultHasP.data![0].CONDIC
            obj.data['valorApontado'] = minToProd
            obj.data['QTDE_LIB'] = minToProd
            response.childCode = codigoFilho
            response.quantidade = minToProd
            response.message = message(14);
            response.execut = execut
            return response;
        }
    } else {
        return response.message = message(0)
    }
}