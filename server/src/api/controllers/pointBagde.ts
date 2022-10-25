import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { sanitize } from "../utils/sanitize";

export const pointBagde: RequestHandler = async (req, res) => {
    let matricula = String(sanitize(req.body["MATRIC"])) || null
    let start = new Date() || 0;

    if (matricula === null) {
        return res.redirect("/#/codigobarras?error=invalidBadge")
    }

    const connection = await mssql.connect(sqlConfig);
    try {
        const selecionarMatricula = await connection.query(` 
        SELECT TOP 1 [MATRIC], [FUNCIONARIO] FROM FUNCIONARIOS WHERE 1 = 1 AND [MATRIC] = '${matricula}'
            `.trim()
        ).then(result => result.recordset)
        if (selecionarMatricula.length > 0) {
            res.cookie("starterBarcode", start)
            res.cookie("MATRIC", selecionarMatricula[0].MATRIC)
            res.cookie("FUNCIONARIO", selecionarMatricula[0].FUNCIONARIO)
            return res.redirect("/#/codigobarras?status=ok")
        }
        if (!selecionarMatricula) {
            return res.redirect("/#/codigobarras?error=invalidBadge")
        }
    } catch (error) {
        console.log(error)
        return res.redirect("/#/codigobarras?error=invalidBadge")
    } finally {
        //await connection.close()
    }
}