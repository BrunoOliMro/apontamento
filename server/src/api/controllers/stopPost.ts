import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";

export const stopPost: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let numeroOdf = String(sanitize(req.cookies["NUMERO_ODF"].trim)) || null
    let funcionario = String(sanitize(req.cookies['FUNCIONARIO'].trim)) || null
    let codigoPeca = String(sanitize(req.cookies['CODIGO_PECA'].trim)) || null
    let revisao = Number(sanitize(req.cookies['REVISAO'].trim)) || 0
    let numeroOperacao = String(req.cookies['NUMERO_OPERACAO']) || null
    let codigoMaq = String(sanitize(req.cookies['CODIGO_MAQUINA'].trim)) || null
    let qtdLibMax = Number(sanitize(req.cookies['qtdLibMax'].trim)) || 0

    //Encerra o processo todo
    let end = new Date().getTime() || 0 ;
    let start = Number(req.cookies["starterBarcode"]) || 0
    let newStart = Number(new Date(start).getTime()) || 0
    let final = Number(end - newStart) || 0

    try {
        //Insere O CODAPONTA 5
        const resour = await connection.query(`
            INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
            VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , ${numeroOperacao} ,${numeroOperacao}, 'D', '${codigoMaq}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '5' , '5', 'Parada.' , '${final}' , '${final}' , '1' ,'0','0')`).then(record => record.recordset)
        if (resour.length <= 0) {
            return res.json({ message: 'erro ao parar a maquina' })
        } else {
            return res.status(200).json({ message: 'maquina parada com sucesso' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: "ocorre um erro ao tentar parar a maquina" })
    } finally {
        await connection.close()
    }
}