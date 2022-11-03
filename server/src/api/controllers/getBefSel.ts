import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { sanitize } from "../utils/sanitize";

export const getBefore: RequestHandler = async (req, res, next) => {
    const connection = await mssql.connect(sqlConfig);
    const numerOdf = Number(sanitize(req.cookies["NUMERO_ODF"]))
    const numerOper = String(sanitize(req.cookies["NUMERO_OPERACAO"]))
    const codMaq = String(sanitize(req.cookies["CODIGO_MAQUINA"]))
    const numeroPeca = String(sanitize(req.cookies['CODIGO_PECA']))

    try {
        const checkForOdf = await connection.query(`
        SELECT
        TOP 1
        * 
        FROM 
        VW_APP_APTO_PROGRAMACAO_PRODUCAO 
        WHERE 1 = 1 
        AND NUMERO_ODF = ${numerOdf}
        AND NUMERO_OPERACAO = ${numerOper}
        AND CODIGO_MAQUINA = '${codMaq}'
        ORDER BY NUMERO_OPERACAO ASC
        `).then(res => res.recordset)

        //console.log("LINHA 28", checkForOdf);

        if(numeroPeca !== checkForOdf[0].CODIGO_PECA ){
            return res.json({ message: 'dados não conferem' });
        }

        if (checkForOdf.length > 0) {
            next()
            //return res.json({ message: "dados conferidos com sucesso"})
        } else {
            return res.json({ message: 'dados não conferem' });
        }
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    } finally {
        //await connection.close()
    }
}