import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const update = async (query: string) => {
    const connection = await mssql.connect(sqlConfig);
    let response: any = {}
    const data = await connection.query(`${query}`).then((result) => result.recordset)

    if (data.length <= 0) {
        return response.message = "Error on update"
    }

    if (data.length >= 0) {
        return response.message = "Update sucess"

    } else {
        return response.message = 'Algo deu errado'
    }
}