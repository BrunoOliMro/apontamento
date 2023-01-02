import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

interface selectResult {
    key: string,
    value: string | number,
  }

export const select: any = async (query: string)  => {
    const connection = await mssql.connect(sqlConfig);
    const data: any = await connection.query(`${query}`).then((result) => result.recordset)
    return data;
}