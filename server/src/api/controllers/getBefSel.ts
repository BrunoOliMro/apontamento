import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { sanitize } from "../utils/sanitize";

export const getBefore: RequestHandler = async (req, res, next) => {
    const connection = await mssql.connect(sqlConfig);
    const numerOdf = Number(sanitize(req.cookies["NUMERO_ODF"]))
    const numerOper = String(sanitize(req.cookies["NUMERO_OPERACAO"]))
    const codMaq = String(sanitize(req.cookies["CODIGO_MAQUINA"]))

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

        if (checkForOdf.length > 0) {
            next()
        }
        
        if (checkForOdf.length <= 0) {
            return res.json({ message: 'dados não conferem conferidos' });
        }

        //return res.json({message : 'erro ao localizar odf'})
    } catch (error) {
        console.log(error)
        return res.json({ error: true, message: "Erro no servidor." });
    } finally {
        //await connection.close()
    }
}