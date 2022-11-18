import mssql from 'mssql';
import { sqlConfig } from '../../global.config'

export const insertInto = async (funcionario: string, numeroOdf: number, codigoPeca: string, revisao: string, numeroOperacao: string, codigoMaq: string, qtdLibMax: number, boas: number, ruins: number, codAponta: number, descricaoCodigoAponta: string, motivo: string, faltante: number, retrabalhada: number, tempoDecorrido: number) => {
    const connection = await mssql.connect(sqlConfig);
    let response: any = {}
    try{
        const data = await connection.query(`INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, UPPER('${codigoPeca}'), UPPER('${revisao}'), '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, ${boas}, ${ruins}, '${funcionario}', '0', ${codAponta}, ${codAponta}, '${descricaoCodigoAponta}', ${tempoDecorrido}, ${tempoDecorrido}, '1', UPPER('${motivo}'), '${faltante}', '${retrabalhada}')`)
        .then((result) => result.rowsAffected)
        if (data) {
            return response.message = "insert done"
        }
        if (!data) {
            return response.message = 'Algo deu errado'
        } else {
            return response.message = 'Algo deu errado'
        }
    } catch (err){
        console.log("linha 22 /Error on insert into/", err);
        return response.message = 'Algo deu errado'
    }
}