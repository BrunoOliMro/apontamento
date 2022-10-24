import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";

export const stopPost : RequestHandler= async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let numeroOdf: string = String(req.cookies["NUMERO_ODF"])
    let funcionario: string = String(req.cookies['FUNCIONARIO'])
    let codigoPeca: string = String(req.cookies['CODIGO_PECA'])
    let revisao: number = Number(req.cookies['REVISAO']) || 0
    let numeroOperacao: string = String(req.cookies['NUMERO_OPERACAO'])
    let codigoMaq: string = String(req.cookies['CODIGO_MAQUINA'])
    let qtdLibMax: number = Number(req.cookies['qtdLibMax'])

    //Encerra o processo todo
    let end = new Date().getTime();
    let start = req.cookies["starterBarcode"]
    let newStart = Number(new Date(start).getTime())
    let final: number = end - newStart

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
        // await connection.close()
    }
}