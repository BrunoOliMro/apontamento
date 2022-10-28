import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";

export const stopSupervisor:RequestHandler = async (req, res) => {
    let supervisor = String(sanitize(req.body['superSuperMaqPar'])) || null
    let numeroOdf = String(sanitize(req.cookies['NUMERO_ODF']))|| null
    let NUMERO_OPERACAO = String(sanitize(req.cookies['NUMERO_OPERACAO']))|| null
    let CODIGO_MAQUINA = String(sanitize(req.cookies['CODIGO_MAQUINA']))|| null
    let qtdLibMax = String(sanitize(req.cookies['qtdLibMax']))|| null
    let funcionario = String(sanitize(req.cookies['FUNCIONARIO']))|| null
    let revisao = Number(sanitize(req.cookies['REVISAO'])) || 0
    let codigoPeca = String(sanitize(req.cookies['CODIGO_PECA']))|| null
    const connection = await mssql.connect(sqlConfig);
    console.log("super", supervisor);
    try {
        const resource = await connection.query(`
        SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA = '${supervisor}'`)
        .then(result => result.recordset);
        if (resource.length > 0) {
            await connection.query(`
            INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , ${NUMERO_OPERACAO} ,${NUMERO_OPERACAO}, 'D', '${CODIGO_MAQUINA}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '3' , '3', 'Fin Prod.' , '0' , '0' , '1' ,'0','0')`)
            return res.status(200).json({ message: 'maquina' })
        } else {
            return res.json({ message: "supervisor não encontrado" })
        }
    } catch (error) {
        return res.json({ message: "erro na parada de maquina" })
    } finally {
        //await connection.close()
    }
}