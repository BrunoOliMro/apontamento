import { RequestHandler } from "express";
import { select } from "../services/select";
import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

export const searchBagde: RequestHandler = async (req, res) => {
    let matricula = String(sanitize(req.body["badge"])) || null
    let start = new Date() || 0;
    let lookForBadge = `SELECT TOP 1 [MATRIC], [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${matricula}' ORDER BY FUNCIONARIO`

    if (!matricula || matricula === '') {
        return res.json({ message: "Empty badge" })
    }

    try {
        const selecionarMatricula = await select(lookForBadge)

        if (selecionarMatricula) {
            const startSetupTime = encrypted(String(start.getTime()))
            const encryptedEmployee = encrypted(String(selecionarMatricula[0].FUNCIONARIO))
            const encryptedBadge = encrypted(String(selecionarMatricula[0].CRACHA))
            res.cookie("startSetupTime", startSetupTime)
            res.cookie("employee", encryptedEmployee)
            res.cookie("badge", encryptedBadge)
            return res.json({ message: 'Badge found' })
        } else if (!selecionarMatricula) {
            return res.json({ message: 'Badge not found' })
        } else {
            return res.json({ message: 'Badge not found' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'Error on searching for badge' })
    }
}