import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const select = async (query: string) => {
    const connection = await mssql.connect(sqlConfig);
    const data = await connection.query(`${query}`).then((result) => result.recordset)

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