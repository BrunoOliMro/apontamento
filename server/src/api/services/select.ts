import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const selectOdfFromPcp = async (dados: any) => {
    const connection = await mssql.connect(sqlConfig);
    let response: any = {}
    const data = await connection.query(`
    SELECT 
    *
    FROM 
    VW_APP_APTO_PROGRAMACAO_PRODUCAO
    (NOLOCK)
    WHERE 1 = 1 
    AND NUMERO_ODF = '${dados.numOdf}' 
    ORDER BY NUMERO_OPERACAO ASC
    `).then((result) => result.recordset)

    if (data.length <= 0) {
        return response.message = "odf nao encontrada"
    }

    if(data.length >= 0){
        console.log("ta aqui provavelmente /linha 24/ select from PCP /");
        return response.data = data
    } else {
        return response.message = 'Algo deu errado'
    }
}