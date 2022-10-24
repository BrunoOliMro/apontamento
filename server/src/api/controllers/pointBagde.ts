import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";

export const pointBagde: RequestHandler = async (req, res) => {
    let MATRIC: string = req.body["MATRIC"]

    if (MATRIC === undefined || MATRIC === null) {
        MATRIC = '0'
    }
    //Sanitizar codigo
    function sanitize(input: String) {
        const allowedChars = /[A-Za-z0-9]/;
        return input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
    }

    MATRIC = sanitize(MATRIC)

    if (MATRIC == '') {
        return res.redirect("/#/codigobarras?error=invalidBadge")
    }

    const connection = await mssql.connect(sqlConfig);
    try {
        const selecionarMatricula = await connection.query(` 
        SELECT TOP 1 [MATRIC], [FUNCIONARIO] FROM FUNCIONARIOS WHERE 1 = 1 AND [MATRIC] = '${MATRIC}'
            `.trim()
        ).then(result => result.recordset)
        if (selecionarMatricula.length > 0) {
            let start = new Date();
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