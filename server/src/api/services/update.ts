import { sqlConfig } from '../../global.config'
import { message } from './message';
import mssql from 'mssql';

export const update = async (chosenOption: number, values?: any) => {
    if (!values) {
        values = {}
    } else if (!chosenOption) {
        chosenOption = 0
    }

    console.log('values in update', values);


    const obj: any = {
        0: `UPDATE PCP_PROGRAMACAO_PRODUCAO SET TEMPO_APTO_TOTAL = GETDATE() WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${values.NUMERO_OPERACAO} AND CODIGO_MAQUINA = '${values.CODIGO_MAQUINA}'`,
        1: `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${values.QTDE_LIB} WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF} AND NUMERO_OPERACAO = ${values.NUMERO_OPERACAO.replaceAll('000', '')}`,
        2: `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA + ${values.valorApontado}, QTD_BOAS = QTD_BOAS - ${values.goodFeed}, QTD_FALTANTE = ${values.missingFeed}, QTDE_LIB = ${values.QTDE_LIB}, QTD_REFUGO = QTD_REFUGO - ${values.badFeed}, QTD_ESTORNADA = COALESCE(QTD_ESTORNADA, 0 ) + ${values.valorTotal} WHERE 1 = 1 AND NUMERO_ODF = '${values.NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${Number(values.NUMERO_OPERACAO.replaceAll(' ', ''))}' AND CODIGO_MAQUINA = '${values.CODIGO_MAQUINA}'`,
        3: `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = COALESCE(QTDE_APONTADA, 0) + ${values.valorApontado || 0}, QTD_REFUGO = COALESCE(QTD_REFUGO, 0) + ${values.badFeed || 0}, QTDE_LIB = ${values.released || 0}, QTD_FALTANTE = ${values.missingFeed || 0}, QTD_BOAS = COALESCE(QTD_BOAS, 0) + ${values.valorFeed || 0}, QTD_RETRABALHADA = COALESCE(QTD_RETRABALHADA, 0) + ${values.reworkFeed || null} WHERE 1 = 1 AND NUMERO_ODF = ${values.NUMERO_ODF || null} AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = ${values.NUMERO_OPERACAO || null} AND CODIGO_MAQUINA = '${values.CODIGO_MAQUINA || null}'`,
        4: `UPDATE CST_ESTOQUE_ENDERECOS SET QUANTIDADE = QUANTIDADE + ${values.quantityToProduce} WHERE 1 = 1 AND ENDERECO = '${values.address}'`,
        5: `UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_LIB = ${values.QTDE_LIB}, WHERE 1 = 1 AND NUMERO_ODF = '${values.NUMERO_ODF}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${Number(values.NUMERO_OPERACAO)}' AND CODIGO_MAQUINA = '${values.CODIGO_MAQUINA}'`
    }
    
    const connection = await mssql.connect(sqlConfig);
    try {
        // Can be used a loop or Object literal
        for (const key in obj) {
            if (Number(key) === chosenOption) {
                var query = obj[key];
            }
        }
        console.log('query', query);
        const data: any = await connection.query(`${query}`).then((result) => result.rowsAffected)
        if (data[0] > 0) {
            console.log('Updated');
            return message(1)
        } else {
            console.log('Error on update');
            return message(17)
        }
    } catch (error) {
        console.log('Error on Update', error);
        return message(33)
    } finally {
        await connection.close()
    }
}