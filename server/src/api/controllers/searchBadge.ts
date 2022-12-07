import { RequestHandler } from "express";
import { select } from "../services/select";
import { cookieGenerator } from "../utils/cookieGenerator";
import { encrypted } from "../utils/encryptOdf";
import { sanitize } from "../utils/sanitize";

export const searchBagde: RequestHandler = async (req, res) => {
    let matricula = String(sanitize(req.body["badge"])) || null
    let lookForBadge = `SELECT TOP 1 [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${matricula}' ORDER BY FUNCIONARIO`

    if (!matricula || matricula === '') {
        return res.json({ message: "Empty badge" })
    }

    try {
        const selecionarMatricula = await select(lookForBadge)

        if (selecionarMatricula) {
            //res.cookie("startSetupTime", encrypted(String(new Date().getTime())))
            selecionarMatricula[0].startSetupTime = encrypted(String(new Date().getTime()))
            await cookieGenerator(res, selecionarMatricula[0])
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