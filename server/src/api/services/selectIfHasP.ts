import { sqlConfig } from '../../global.config'
import { selectQuery } from './query';
import { message } from './message';
import { update } from './update';
import mssql from 'mssql';
import { poolConnection } from '../../queryConnector';

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
    if (resultHasP!.length <= 0) {
        return response.message = message(13)
    } else {
        const execut = resultHasP!.map((element: any) => element.EXECUT)
        const codigoFilho: string[] = resultHasP!.map((item: any) => item.NUMITE)
        const minQtdAllowed: number = Math.min(...resultHasP!.map((element: any) => element.QTD_LIBERADA_PRODUZIR))
        const processItens = resultHasP!.map((item: any) => item.NUMSEQ).filter((element: string) => element === String(String(obj.data['NUMERO_OPERACAO']!).replaceAll(' ', '')).replaceAll('000', ''))
        const minToProd: number = minQtdAllowed < obj.data['QTDE_LIB']! ? minQtdAllowed : Number(obj.data!['QTDE_LIB']);
        const resultQuantityCst = await selectQuery(21, obj.data)
        console.log('resultQuantityCst', resultQuantityCst);

        // If there a values reserved
        if (resultQuantityCst![0]) {
            if (resultQuantityCst![0].hasOwnProperty('QUANTIDADE')) {
                if (resultQuantityCst![0].QUANTIDADE > 0) {
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
            const insertAddressUpdate: string[] = [];
            codigoFilho.forEach((element: string, i: number) => {
                insertAddressUpdate.push(`INSERT INTO HISTORICO_ENDERECO (DATAHORA, ODF, QUANTIDADE, CODIGO_PECA, CODIGO_FILHO, ENDERECO_ATUAL, STATUS, NUMERO_OPERACAO) VALUES (GETDATE(), '${obj.data['NUMERO_ODF']}', ${minToProd} ,'${obj.data['CODIGO_PECA']}', '${element}', '${'999' + element}', 'RESERVA', '${obj.data['NUMERO_OPERACAO']!.replaceAll('000', '')}')`)
                insertAddressUpdate.push(`UPDATE ESTOQUE SET SALDOREAL = SALDOREAL - ${minToProd * execut[i]} WHERE 1 = 1 AND CODIGO = '${element}'`);
                // insertAddressUpdate.push(`UPDATE CST_ALOCACAO SET QUANTIDADE = QUANTIDADE + ${minToProd * execut[i]} WHERE 1 = 1 AND ODF = '${obj.data['NUMERO_ODF']}' AND CODIGO_FILHO = '${element}'`);
                insertAddressUpdate.push(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES (${obj.data['NUMERO_ODF']}, ${String(String(obj.data['NUMERO_OPERACAO']!).replaceAll(' ', '')).replaceAll('000', '')}, '${obj.data['CODIGO_PECA']}', '${element}', ${minToProd * execut[i]}, 'ADDRESS', NULL, GETDATE(), '${obj.data['FUNCIONARIO']}')`);
            })
            // const connection = await mssql.connect(sqlConfig);
            // const x =  await connection.query(insertAddressUpdate.join('\n')).then(result => result.rowsAffected)

            const conn = await poolConnection()
            await conn.request().query(insertAddressUpdate.join('\n')).then((result: any) => result.recordset)
            await update(5, obj.data)
            response.condic = resultHasP![0].CONDIC
            obj.data['valorApontado'] = minToProd
            obj.data['QTDE_LIB'] = minToProd
            response.childCode = codigoFilho
            response.quantidade = minToProd
            response.message = message(14);
            response.execut = execut
            return response;
        } catch (error) {
            console.log('linha 141 /selectHasP/', error);
            return response.message = message(0)
        }
    }
}