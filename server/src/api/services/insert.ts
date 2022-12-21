import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const insertInto = async (funcionario: string | null, numeroOdf: number | null, codigoPeca: string | null, revisao: string | null, numeroOperacao: string | null, codigoMaq: string | null, qtdLibMax: number | null, boas: number | null, ruins: number | null, codAponta: number[], descricaoCodigoAponta: string | null, motivo: string | null, faltante: number | null, retrabalhada: number | null, tempoDecorrido: number | null) => {
    let response = {
        message: '',
    }
    //const data = await connection.query(`Begin Try BEGIN TRANSACTION INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, UPPER('${codigoPeca}'), UPPER('${revisao}'), '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, ${boas}, ${ruins}, '${funcionario}', '0', ${codAponta}, ${codAponta}, '${descricaoCodigoAponta}', ${tempoDecorrido}, ${tempoDecorrido}, '1', UPPER('${motivo}'), ${faltante}, ${retrabalhada}) COMMIT TRANSACTION End Try Begin Catch ROLLBACK End Catch`).then((result) => result.rowsAffected)
    try {
        const data: any = [];
        const connection = await mssql.connect(sqlConfig);
        codAponta.forEach(async (element) => {
            let y = `INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, UPPER('${codigoPeca}'), UPPER('${revisao}'), '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, ${boas}, ${ruins}, '${funcionario}', '0', ${element}, ${element}, '${descricaoCodigoAponta}', ${tempoDecorrido}, ${tempoDecorrido}, '1', UPPER('${motivo}'), ${faltante}, ${retrabalhada})`
            data.push(y)
        });
        const resultInsert = await connection.query(data.join("\n")).then(result => result.rowsAffected)
        if (resultInsert) {
            return response.message = 'Success'
        } else {
            return response.message = 'Error'
        }
    } catch (err) {
        console.log('linha 25 /Error on insert into/', err);
        return response.message = 'Algo deu errado'
    }
}