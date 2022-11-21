import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const selectAddress = async (codigoPeca: number, percentage: number) => {
    const connection = await mssql.connect(sqlConfig);
    const data = await connection.query(`
    SELECT 
    EE.CODIGO AS COD_PRODUTO, NULL AS COD_PRODUTO_EST, CE.CODIGO,CE.ENDERECO, ISNULL(EE.QUANTIDADE,0) AS QUANTIDADE 
    FROM 
    CST_CAD_ENDERECOS CE(NOLOCK)
    LEFT JOIN CST_ESTOQUE_ENDERECOS EE (NOLOCK) ON UPPER(CE.ENDERECO) = UPPER(EE.ENDERECO)
    WHERE ISNULL(EE.QUANTIDADE,0) > 0 AND CE.ENDERECO LIKE '${percentage}%' AND UPPER(EE.CODIGO) = UPPER('${codigoPeca}') 
        ORDER BY CE.ENDERECO ASC`).then((result) => result.recordset)

    type Response = { message: string, data: {} }

    let response: Response = {
        message: '',
        data: {},
    }

    if (data.length <= 0) {
        return response.message = "odf nao encontrada"
    }

    if (data.length >= 0) {
        return response.data = data
    } else {
        return response.message = 'Algo deu errado'
    }
}