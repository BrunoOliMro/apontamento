import mssql from 'mssql';
import { sqlConfig } from '../../global.config'
import { message } from './message';

export const insertIntoNewOrder = async ( variables: any, chosenOption: number) => {
    const connection = await mssql.connect(sqlConfig);
    const codes: { [key: string]: string } = {
        0: `INSERT INTO NOVA_ORDEM (NUMERO_ODF, NUMERO_OPERACAO, CODIGO_MAQUINA, QTDE_ODF, QTDE_LIB, QTDE_APONTADA, QTD_REFUGO, QTD_BOAS, QTD_RETRABALHADA, QTD_FALTANTE, CODIGO_PECA, CODIGO_CLIENTE, USUARIO, REVISAO) VALUES('${variables.cookies.NUMERO_ODF}', '${variables.cookies.NUMERO_OPERACAO}', '${variables.cookies.CODIGO_MAQUINA}', ${variables.QTDE_ODF}, ${variables.released},${variables. totalValue}, ${variables.body.badFeed || null}, ${variables.body.valorFeed || null},  ${variables.body.reworkFeed || null}, ${variables.body.missingFeed || null}, '${variables.cookies.CODIGO_PECA}', '${variables.CODIGO_CLIENTE}', '${variables.cookies.FUNCIONARIO}', '${variables.cookies.REVISAO}')`,
    }
    
    try {
        const data = await connection.query(`${codes[String(chosenOption)]}`).then((result) => result.recordset)
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