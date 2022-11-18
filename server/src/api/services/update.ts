import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const update = async (table: string, column: string, where: string) => {
    const connection = await mssql.connect(sqlConfig);
    let response: any = {}
    const data = await connection.query(`
    UPDATE ${table} SET ${column} WHERE 1 = 1 ${where}
    `).then((result) => result.recordset)

    if (data.length <= 0) {
        return response.message = "Error on update"
    }

    if (data.length >= 0) {
        return response.message = "Update sucess"

    } else {
        return response.message = 'Algo deu errado'
    }
}