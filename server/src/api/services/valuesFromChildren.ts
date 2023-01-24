import { sqlConfig } from '../../global.config';
import { getAddress } from './getAddress';
import mssql from 'mssql';
import { message } from './message';


export const getChildrenValuesBack = async (variables: any, req: any) => {
    var returnValueAddress;
        try {
            if (!variables.cookies.childCode) {
                return {message: message(0)}
            }
            // Loop para atualizar o estoque
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
                    if (valuesToReturnStorage) {
                        returnValueAddress = await getAddress(valuesToReturnStorage, variables, req)
                    }
                    const connection = await mssql.connect(sqlConfig);
                    await connection.query(updateSaldoReal.join('\n')).then(result => result.rowsAffected)
                } catch (error) {
                    console.log('linha 140  - Point.ts - ', error);
                    return {message: message(0)}
                }
            }
            try {
                // Loop para desconstar o saldo alocado
                const deleteCstAlocacao: string[] = [];
                variables.cookies.childCode.split(',').forEach((codigoFilho: string) => {
                    const stringUpdate: string = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${variables.cookies.NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho}'`
                    deleteCstAlocacao.push(stringUpdate)
                });
                const connection = await mssql.connect(sqlConfig);
                const x = await connection.query(deleteCstAlocacao.join('\n')).then(result => result.rowsAffected)
                if(x){
                    return { returnValueAddress: returnValueAddress }
                } else {
                    return {message : message(0)}
                }
            } catch (error) {
                console.log('linha 159  - Point.ts - ', error);
                return
            } finally {
                await connection.close()
            }
        } catch (error) {
            console.log('linha 165  - Point.ts - ', error);
            return {message : message(0)}
        }
}