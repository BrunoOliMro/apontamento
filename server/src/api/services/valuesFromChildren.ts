import { sqlConfig } from '../../global.config';
import { getAddress } from './getAddress';
import { message } from './message';
import mssql from 'mssql';

export const getChildrenValuesBack = async (variables: any, req: any) => {
    var returnValueAddress: any;
    try {
        if (!variables.cookies.childCode) {
            return { message: message(0) }
        }
        // Loop to update SALDOREAL
        const connection = await mssql.connect(sqlConfig);
        if (variables.cookies.totalValue < Number(variables.cookies.QTDE_LIB)!) {
            try {
                const updateSaldoReal: string[] = [];
                let valuesToReturnStorage: number = 0
                variables.cookies.childCode.split(',').forEach((codigoFilho: string, i: number) => {
                    valuesToReturnStorage += variables.cookies.execut.split(',')[i] * Number(variables.cookies.QTDE_LIB) - variables.cookies.totalValue * variables.cookies.execut.split(',')[i]
                    const stringUpdate = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${variables.cookies.execut.split(',')[i] * Number(variables.cookies.QTDE_LIB) - variables.cookies.totalValue * variables.cookies.execut.split(',')[i]} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`
                    updateSaldoReal.push(stringUpdate)
                });
                const insertEveryAddress: string[] = []
                if (valuesToReturnStorage) {
                    returnValueAddress = await getAddress(valuesToReturnStorage, variables, req)
                }

                // Insert to HISTORICO_ENDERECO
                variables.cookies.childCode.split(',').forEach((element: string, i: number) => {
                    insertEveryAddress.push(`INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${variables.cookies.NUMERO_ODF}', ${variables.cookies.execut.split(',')[i] * Number(variables.cookies.QTDE_LIB) - variables.cookies.totalValue * variables.cookies.execut.split(',')[i]} ,'${variables.cookies.CODIGO_PECA}', '${element}', '${returnValueAddress.address[0].ENDERECO || null}', 'DEVOLUÇÃO', '${variables.cookies.NUMERO_OPERACAO}')`)
                });
                const connection = await mssql.connect(sqlConfig);
                await connection.query(updateSaldoReal.join('\n')).then(result => result.rowsAffected)
                await connection.query(insertEveryAddress.join('\n')).then(result => result.rowsAffected)
            } catch (error) {
                console.log('linha 36  - valuesFromChildren.ts - ', error);
                return { message: message(0) }
            }
        }

        // try {
        //     // Insert loop to log every address in odf
        //     const insertEveryAddress: string[] = []
        //     console.log('returnValueAddress.address[0].ENDERECO', returnValueAddress.address[0].ENDERECO);
        //     console.log('variables.cookies.goodFeed', variables.cookies.goodFeed);
        //     // Insert to HISTORICO_ENDERECO
        //     variables.cookies.childCode.split(',').forEach((element: string) => {
        //         console.log('ele: ', element);
        //         insertEveryAddress.push(`INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${variables.cookies.NUMERO_ODF}', ${Number(variables.cookies.goodFeed)} ,'${variables.cookies.CODIGO_PECA}', '${element}', '${returnValueAddress.address[0].ENDERECO || null}', 'APONTADO', '${variables.cookies.NUMERO_OPERACAO}')`)
        //     });
        //     const connection = await mssql.connect(sqlConfig);
        //     await connection.query(insertEveryAddress.join('\n')).then(result => result.rowsAffected)
        // } catch (error) {
        //     console.log('Error in insert address linha 51 -valuesFromChildren-', error);
        //     return { message: message(4) }
        // }

        try {
            // Loop to delete reserved itens
            const deleteCstAlocacao: string[] = [];
            variables.cookies.childCode.split(',').forEach((codigoFilho: string) => {
                const stringUpdate: string = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${variables.cookies.NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho}'`
                deleteCstAlocacao.push(stringUpdate)
            });
            const connection = await mssql.connect(sqlConfig);
            const x = await connection.query(deleteCstAlocacao.join('\n')).then(result => result.rowsAffected)
            if (x) {
                return { returnValueAddress: returnValueAddress }
            } else {
                return { message: message(0) }
            }
        } catch (error) {
            console.log('linha 70  - valuesFromChildren.ts - ', error);
            return
        } finally {
            await connection.close()
        }
    } catch (error) {
        console.log('linha 76  - valuesFromChildren.ts - ', error);
        return { message: message(0) }
    }
}