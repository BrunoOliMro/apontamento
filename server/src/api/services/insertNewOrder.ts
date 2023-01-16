import mssql from 'mssql';
import { sqlConfig } from '../../global.config'
import { message } from './message';

export const insertIntoNewOrder = async (string: string) => {
    const connection = await mssql.connect(sqlConfig);
    try {
        const data = await connection.query(`${string}`).then((result) => result.recordset)
        if (data) {
            return data;
        } else {
            return message(17)
        }
    } catch (error) {
        console.log('linha 13 /Error on insert into new Order/', error);
        return message(33)
    } finally {
        await connection.close()
    }
}