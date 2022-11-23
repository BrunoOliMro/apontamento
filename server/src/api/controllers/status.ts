import { RequestHandler } from "express";
import sanitize from "sanitize-html";
import { select } from "../services/select";
import { decrypted } from "../utils/decryptedOdf";

export const status: RequestHandler = async (req, res) => {
    let numpec = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
    let maquina = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    let tempoAgora = new Date().getTime() || 0
    let startTime = decrypted(String(sanitize(req.cookies['startSetupTime']))) || null;
    let startTimeNow: number = Number(startTime) || 0;
    let tempoDecorrido = Number(tempoAgora - startTimeNow) || 0;
    let lookForTimer = `SELECT TOP 1 EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${numpec}' AND MAQUIN = '${maquina}' ORDER BY REVISAO DESC`
    try {
        const resource = await select(lookForTimer)
        // const resource = await connection.query(`
        // SELECT 
        // TOP 1 
        // EXECUT 
        // FROM 
        // OPERACAO 
        // WHERE 1 = 1
        // AND NUMPEC = '${numpec}' 
        // AND MAQUIN = '${maquina}' 
        // ORDER BY REVISAO DESC
        // `).then(record => record.recordset)

        //res.cookie("Tempo Execucao", resource[0].EXECUT) 
        let qtdProd = Number(req.cookies["qtdProduzir"][0])

        //valor em segundos
        let tempoExecut = Number(resource[0].EXECUT)

        //valor vezes a quantidade de peças
        let tempoTotalExecução = Number(tempoExecut * qtdProd) * 1000
        let tempoRestante = (tempoTotalExecução - tempoDecorrido)
        //tempoRestante = 600000

        if (tempoRestante <= 0) {
            tempoRestante = 0
        }
        return res.status(200).json(tempoRestante)
        // }
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    } finally {
        //await connection.close()
    }
}