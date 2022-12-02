import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const insertInto = async (funcionario: string, numeroOdf: number, codigoPeca: string, revisao: string, numeroOperacao: string, codigoMaq: string, qtdLibMax: number, boas: number, ruins: number, codAponta: number, descricaoCodigoAponta: string, motivo: string | null, faltante: number, retrabalhada: number, tempoDecorrido: number) => {
    let response = {
        message: '',
    }
    
    try {
        const connection = await mssql.connect(sqlConfig);
        const data = await connection.query(`Begin Try BEGIN TRANSACTION INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, UPPER('${codigoPeca}'), UPPER('${revisao}'), '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, ${boas}, ${ruins}, '${funcionario}', '0', ${codAponta}, ${codAponta}, '${descricaoCodigoAponta}', ${tempoDecorrido}, ${tempoDecorrido}, '1', UPPER('${motivo}'), ${faltante}, ${retrabalhada}) COMMIT TRANSACTION End Try Begin Catch ROLLBACK End Catch`).then((result) => result.rowsAffected)

        if (data) {
            return response.message = 'insert done'
        } else if (!data) {
            return response.message = 'insert was not done'
        } else {
            return response.message = 'Error on insert into'
        }
    } catch (err) {
        console.log('linha 22 /Error on insert into/', err);
        return response.message = 'Algo deu errado'
    // } finally {
    //     await connection.close()
    // }
}