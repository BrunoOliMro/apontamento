import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const update = async (query: string) => {
    const connection = await mssql.connect(sqlConfig);
    let response = {
        message: '',
    }
    const data: any = await connection.query(`${query}`).then((result) => result.rowsAffected)
    console.log('linha 10 /Data -- Update --/ ', data[0]) 
    if (data[0] > 0) {
        console.log('SUCESSO');
        return response.message = "Success"
    } else {
        console.log('ERROR');
        return response.message = "Error"
    }
}