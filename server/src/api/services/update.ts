import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const update = async (query: string) => {
    const connection = await mssql.connect(sqlConfig);
    let response = {
        message: '',
    }
    const data: any = await connection.query(`${query}`).then((result) => result.rowsAffected)
    console.log('linha 10 /update Data/', data);
    if (data.length <= 0) {
        return response.message = "Error on update"
    } else if (data.length >= 0) {
        return response.message = "Update sucess"
    } else {
        return response.message = 'Algo deu errado'
    }
}