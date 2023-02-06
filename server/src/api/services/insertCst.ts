import mssql from 'mssql';
import { sqlConfig } from '../../global.config'
import { message } from './message';

export const insertInto = async (funcionario: string, numeroOdf: number, codigoPeca: string, revisao: string, numeroOperacao: string, codigoFilho: string, i: number) => {
    const connection = await mssql.connect(sqlConfig);
    try {
        const data = await connection.query(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES (${numeroOdf}, ${numeroOperacao}, '${codigoPeca}', '${codigoFilho[i]}', ${revisao}, 'ADDRESS', NULL, GETDATE(), '${funcionario}')`).then((result) => result.rowsAffected)
        if (data) {
            return message(35)
        } else {
            return message(17)
        }
    } catch (error) {
        console.log('linha 22 /Error on insert into/', error);
        return message(33)
    }
}