import { sqlConfig } from '../../global.config'
import { message } from './message';
import mssql from 'mssql';
//const data = await connection.query(`Begin Try BEGIN TRANSACTION INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) VALUES (GETDATE(), '${funcionario}', ${numeroOdf}, UPPER('${codigoPeca}'), UPPER('${revisao}'), '${numeroOperacao}', '${numeroOperacao}', 'D', '${codigoMaq}', ${qtdLibMax}, ${boas}, ${ruins}, '${funcionario}', '0', ${codAponta}, ${codAponta}, '${descricaoCodigoAponta}', ${tempoDecorrido}, ${tempoDecorrido}, '1', UPPER('${motivo}'), ${faltante}, ${retrabalhada}) COMMIT TRANSACTION End Try Begin Catch ROLLBACK End Catch`).then((result) => result.rowsAffected)
export const insertInto = async (obj: any) => {
    try {
        const stringArray: any = [];
        obj.pointedCode.forEach((element: any, i: number) => {
            let string = `INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2, TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, MOTIVO_REFUGO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA ) VALUES (GETDATE(), '${obj.FUNCIONARIO}', ${obj.NUMERO_ODF}, UPPER('${obj.CODIGO_PECA}'), UPPER('${obj.REVISAO}'), '${obj.NUMERO_OPERACAO}', '${obj.NUMERO_OPERACAO}', 'D', '${obj.CODIGO_MAQUINA}', ${obj.QTDE_LIB}, ${obj.goodFeed || null}, ${obj.badFeed || null}, '${obj.FUNCIONARIO}', '0', ${element}, ${element}, '${obj.pointedCodeDescription![i]}', ${obj.tempoDecorrido || null}, ${obj.tempoDecorrido || null}, '1', UPPER('${obj.motives || null}'), ${obj.missingFeed || null}, ${obj.reworkFeed || null})`
            stringArray.push(string)
        });
        const connection = await mssql.connect(sqlConfig);
        const data = await connection.query(stringArray.join("\n")).then(result => result.rowsAffected)
        await connection.close()
        return data
    } catch (err) {
        console.log('linha 25 /Error on insert into/', err);
        return message(33)
    }
}