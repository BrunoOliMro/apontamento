import { RequestHandler } from "express";
import mssql from "mssql";
import { sqlConfig } from "../../global.config";
import { decrypted } from "../utils/decryptedOdf";
import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

export const pointBagde: RequestHandler = async (req, res) => {
    let matricula = String(sanitize(req.body["cracha"])) || null
    let start = new Date() || 0;

    if (!matricula) {
        return res.json({ message: "codigo de matricula vazia" })
    }

    const connection = await mssql.connect(sqlConfig);
    try {
        const selecionarMatricula = await connection.query(` 
        SELECT TOP 1 [MATRIC], [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${matricula}' ORDER BY FUNCIONARIO
            `.trim()
        ).then(result => result.recordset)

        if (selecionarMatricula.length > 0) {
            const strStartTime = encrypted(String(start.getTime()))

            const encryptedEmployee = encrypted(selecionarMatricula[0].FUNCIONARIO)
            const encryptedBadge = encrypted(selecionarMatricula[0].CRACHA)
            res.cookie("starterBarcode", strStartTime)
            //res.cookie("MATRIC", selecionarMatricula[0].MATRIC)
            res.cookie("FUNCIONARIO", encryptedEmployee)
            res.cookie("CRACHA", encryptedBadge)
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