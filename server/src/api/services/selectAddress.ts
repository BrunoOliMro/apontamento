import mssql from 'mssql';
import { sqlConfig } from '../../global.config'
import { message } from './message';

export const selectAddress = async (condicional: string, percentage: number, comprimento: number, largura: number, peso: number) => {
    const connection = await mssql.connect(sqlConfig);
    try {
        const data = await connection.query(`
        SELECT TOP 1 
        EE.CODIGO AS COD_PRODUTO,
        NULL AS COD_PRODUTO_EST, 
        CE.CODIGO,
        CE.ENDERECO, 
        ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
        FROM CST_CAD_ENDERECOS CE(NOLOCK)
        LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
        WHERE ISNULL(EE.QUANTIDADE,0) <= 0 AND CE.ENDERECO LIKE '${percentage}%' AND UPPER(EE.CODIGO) ${condicional} AND CE.COMPRIMENTO > ${comprimento} AND CE.LARGURA > ${largura} AND CE.PESO > ${peso} ORDER BY CE.ENDERECO ASC`).then((result) => result.recordset)
        if (data.length > 0) {
            return data
        } else {
            return message(17)
        }
    } catch (error) {
        console.log('Error on selecting Address', error);
        return message(33)
    } finally {
        await connection.close()
    }
}