import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { sanitize } from "../utils/sanitize";

export const pointBagde: RequestHandler = async (req, res) => {
    let matricula = String(sanitize(req.body["cracha"])) || null
    let start = new Date() || 0;


    if (matricula === null) {
        return res.json({ message: "codigo de matricula vazia" })
    }

    const connection = await mssql.connect(sqlConfig);
    try {
        const selecionarMatricula = await connection.query(` 
        SELECT TOP 1 [MATRIC], [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${matricula}' ORDER BY FUNCIONARIO
            `.trim()
        ).then(result => result.recordset)

        if (selecionarMatricula.length > 0) {
            res.cookie("starterBarcode", start)
            //res.cookie("MATRIC", selecionarMatricula[0].MATRIC)
            res.cookie("FUNCIONARIO", selecionarMatricula[0].FUNCIONARIO)
            res.cookie("CRACHA", selecionarMatricula[0].CRACHA)
            return res.json({ message: 'cracha encontrado' })
        } else {
            return res.json({ message: 'cracha não encontrado' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'erro ao tentar localizar cracha' })
    } finally {
        //await connection.close()
    }
}