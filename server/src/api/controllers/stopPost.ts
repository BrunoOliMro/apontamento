import { RequestHandler } from "express";
import mssql from "mssql";
import sanitize from "sanitize-html";
import { sqlConfig } from "../../global.config";
import { insertInto } from "../services/insert";
import { decrypted } from "../utils/decryptedOdf";

export const stopPost: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let numeroOdf = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    let funcionario = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    let codigoPeca = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
    let revisao = decrypted(String(sanitize(req.cookies['REVISAO']))) || null
    let numeroOperacao = decrypted(String(req.cookies['NUMERO_OPERACAO'])) || null
    let codigoMaq = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    let qtdLibMax = decrypted(String(sanitize(req.cookies['qtdLibMax']))) || null

    //Encerra o processo todo
    let end = new Date().getTime() || 0;
    let start = decrypted(String(sanitize(req.cookies["starterBarcode"]))) || 0
    let newStart: number
    newStart = Number(start)
    let final = Number(end - newStart) || 0

    console.log("linha 25 /stop post/");
    let boas = 0
    let faltante = 0
    let retrabalhada = 0
    let codAponta = 7
    let ruins = 0
    let motivo = ''
    let descricaoCodAponta = 'Parada'
    try {
        //Insere O CODAPONTA 5
        // const resour = await connection.query(`
        //     INSERT INTO HISAPONTA (DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ,  CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA)
        //     VALUES(GETDATE(), '${funcionario}' , '${numeroOdf}' , '${codigoPeca}' , '${revisao}' , '${numeroOperacao}' ,'${numeroOperacao}', 'D', '${codigoMaq}' , '${qtdLibMax}' , '0' , '0' , '${funcionario}' , '0' , '5' , '5', 'Parada.' , '${final}' , '${final}' , '1' ,'0','0')`
        //     ).then(record => record.rowsAffected)

        const resour: any = await insertInto(funcionario, numeroOdf, codigoPeca, revisao, numeroOperacao, codigoMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, final)
        console.log("parada", resour);

        if(resour){
            return res.status(200).json({ message: 'maquina parada com sucesso' })
        } else {
            return res.json({ message: 'erro ao parar a maquina' })
        }

    } catch (error) {
        console.log(error)
        return res.json({ message: "ocorre um erro ao tentar parar a maquina" })
    } finally {
        await connection.close()
    }
}