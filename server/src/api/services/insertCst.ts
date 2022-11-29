import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const insertInto = async (funcionario: string, numeroOdf: number, codigoPeca: string, revisao: string, numeroOperacao: string, codigoMaq: string, qtdLibMax: number, boas: number, ruins: number, codAponta: number, descricaoCodigoAponta: string, motivo: string, faltante: number, retrabalhada: number, tempoDecorrido: number) => {
    const connection = await mssql.connect(sqlConfig);
    let response = {
        message: '',
    }

    try {
        const data = await connection.query(`INSERT INTO CST_ALOCACAO (ODF, NUMOPE, CODIGO, CODIGO_FILHO, QUANTIDADE, ENDERECO, ALOCADO, DATAHORA, USUARIO) VALUES ('1504024', 40, '105831437', '105831437-3', 2, 'WEUHGV', NULL, GETDATE(), 'CESAR')`)
            .then((result) => result.rowsAffected)
        console.log("insert into -");
        if (data) {
            return response.message = "insert done"
        }
        if (!data) {
            return response.message = 'Algo deu errado'
        } else {
            return response.message = 'Algo deu errado'
        }
    } catch (err) {
        console.log("linha 22 /Error on insert into/", err);
        return response.message = 'Algo deu errado'
    }
}