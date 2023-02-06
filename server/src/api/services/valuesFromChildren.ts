import { sqlConfig } from '../../global.config';
import { message } from './message';
import mssql from 'mssql';

export const getChildrenValuesBack = async (variables: any, req: any) => {
    if (!variables.cookies.childCode) {
        return { message: message(0) }
    }

    // Loop to update SALDOREAL
    // Loop to delete reserved itens
    var returnValueAddress: any;
    const updateSaldoReal: string[] = [];
    variables.cookies.childCode.split(',').forEach(async (codigoFilho: string, i: number) => {
        if (variables.cookies.totalValue < Number(variables.cookies.QTDE_LIB)!) {
            const stringUpdate = `UPDATE ESTOQUE SET SALDOREAL = SALDOREAL + ${variables.cookies.execut.split(',')[i] * Number(variables.cookies.QTDE_LIB) - variables.cookies.totalValue * variables.cookies.execut.split(',')[i]} WHERE 1 = 1 AND CODIGO = '${codigoFilho}'`
            const inserted = `INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${variables.cookies.NUMERO_ODF}', ${variables.cookies.execut.split(',')[i] * Number(variables.cookies.QTDE_LIB) - variables.cookies.totalValue * variables.cookies.execut.split(',')[i]} ,'${variables.cookies.CODIGO_PECA}', '${codigoFilho}', '${!returnValueAddress  ? message(33) : returnValueAddress.address[0].ENDERECO}', 'DEVOLUÇÃO', '${variables.cookies.NUMERO_OPERACAO}')`
            updateSaldoReal.push(stringUpdate)
            updateSaldoReal.push(inserted)
        }
        const stringUpdate: string = `DELETE CST_ALOCACAO WHERE 1 = 1 AND ODF = '${variables.cookies.NUMERO_ODF}' AND CODIGO_FILHO = '${codigoFilho}'`
        updateSaldoReal.push(stringUpdate)
    })

    try {
        const connection = await mssql.connect(sqlConfig);
        await connection.query(updateSaldoReal.join('\n')).then(result => result.rowsAffected)
        return returnValueAddress || null
    } catch (error) {
        console.log('linha 76  - valuesFromChildren.ts - ', error);
        return { message: message(0) }
    }
}