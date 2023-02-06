import mssql from 'mssql';
import { sqlConfig } from '../../global.config'
import { message } from './message';

export const deleteQuery: any = async (query: string) => {
    const connection = await mssql.connect(sqlConfig);
    try {
        const data = await connection.query(`${query}`).then((result) => result.recordset)
        if (data) {
            return data
        } else {
            return message(17)
        }
    } catch (error) {
        console.log('Error on delete', error)
        return message(33)
    } finally {
        await connection.close()
    }
}