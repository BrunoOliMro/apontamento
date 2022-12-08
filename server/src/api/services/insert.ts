import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const insertInto = async (funcionario: string | null, numeroOdf: number | null, codigoPeca: string | null, revisao: string | null, numeroOperacao: string | null, codigoMaq: string | null, qtdLibMax: number | null, boas: number | null, ruins: number | null, codAponta: number | null, descricaoCodigoAponta: string | null, motivo: string | null, faltante: number | null, retrabalhada: number | null, tempoDecorrido: number | null) => {
    let response = {
        message: '',
    }
    //const data = await connection.query(`Begin Try BEGIN TRANSACTION INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, UPPER('${codigoPeca}'), UPPER('${revisao}'), '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, ${boas}, ${ruins}, '${funcionario}', '0', ${codAponta}, ${codAponta}, '${descricaoCodigoAponta}', ${tempoDecorrido}, ${tempoDecorrido}, '1', UPPER('${motivo}'), ${faltante}, ${retrabalhada}) COMMIT TRANSACTION End Try Begin Catch ROLLBACK End Catch`).then((result) => result.rowsAffected)
    try {
        const connection = await mssql.connect(sqlConfig);
        const data = await connection.query(`INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, UPPER('${codigoPeca}'), UPPER('${revisao}'), '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, ${boas}, ${ruins}, '${funcionario}', '0', ${codAponta}, ${codAponta}, '${descricaoCodigoAponta}', ${tempoDecorrido}, ${tempoDecorrido}, '1', UPPER('${motivo}'), ${faltante}, ${retrabalhada})`).then((result) => result.rowsAffected)
        return data;
    } catch (err) {
        console.log('linha 22 /Error on insert into/', err);
        return response.message = 'Algo deu errado'
    }
}