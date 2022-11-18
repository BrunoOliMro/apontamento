import { RequestHandler } from "express";
import { select } from "../services/select";
import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

export const pointBagde: RequestHandler = async (req, res) => {
    let matricula = String(sanitize(req.body["cracha"])) || null
    let start = new Date() || 0;

    if (!matricula) {
        return res.json({ message: "codigo de matricula vazia" })
    }

    try {
        // const selecionarMatricula = await connection.query(` 
        // SELECT TOP 1 [MATRIC], [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${matricula}' ORDER BY FUNCIONARIO
        //     `.trim()
        // ).then(result => result.recordset)

        let table = `FUNCIONARIOS`
        let top = `TOP 1`
        let column = `[MATRIC], [FUNCIONARIO], [CRACHA]`
        let where = `AND [CRACHA] = '${matricula}'`
        let orderBy = `ORDER BY FUNCIONARIO`

        const selecionarMatricula = await select(table, top, column, where, orderBy)

        if (selecionarMatricula.length > 0) {
            const strStartTime = encrypted(String(start.getTime()))
            const encryptedEmployee = encrypted(String(selecionarMatricula[0].FUNCIONARIO))
            const encryptedBadge = encrypted(String(selecionarMatricula[0].CRACHA))
            res.cookie("starterBarcode", strStartTime)
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