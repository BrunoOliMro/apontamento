import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const select = async (query: string) => {
    const connection = await mssql.connect(sqlConfig);
    const data = await connection.query(`${query}`).then((result) => result.recordset)
    //console.log("linha 7 /select.ts/", data);
    type Response = { message: string, data: {} }

    let response: Response = {
        message: '',
        data: {},
    }

    if (data.length <= 0) {
        return response.message = "Data not found"
    }
    if (data.length >= 0) {
        return response.data = data
    } else {
        return response.message = 'Algo deu errado'
    }
}