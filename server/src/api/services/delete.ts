import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const deleteQuery: any = async (query: string) => {
    const connection = await mssql.connect(sqlConfig);
    const data = await connection.query(`${query}`).then((result) => result.recordset)
    return data;
}