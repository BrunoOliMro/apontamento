import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const insertIntoNewOrder = async (string : string) => {
    let response = {
        message: '',
    }
    try {
        const connection = await mssql.connect(sqlConfig);
        const data = await connection.query(`${string}`).then((result) => result.recordset)
        return data;
    } catch (err) {
        console.log('linha 13 /Error on insert into new Order/', err);
        return response.message = 'Algo deu errado'
    }
}