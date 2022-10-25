import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { sanitize } from "../utils/sanitize";

export const historic: RequestHandler = async (req, res) => {
    const connection = await mssql.connect(sqlConfig);
    let NUMERO_ODF = Number(sanitize(req.cookies["NUMERO_ODF"]))
    try {
        const resource = await connection.query(`
        SELECT
        *
        FROM VW_APP_APONTAMENTO_HISTORICO
        WHERE 1 = 1
        AND ODF = '${NUMERO_ODF}'
        ORDER BY OP ASC
        `.trim()).then(result => result.recordset)

        if (resource.length <= 0) {
            return res.json({ error: true, message: "Erro no servidor." });
        } else {
            return res.json(resource)
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: true, message: "Erro no servidor." });
    } finally {
        //await connection.close()
    }
}