import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { insertInto } from '../services/insert';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { RequestHandler } from 'express';

export const stopSupervisor: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)
    variables.cookies.goodFeed = null
    variables.cookies.badFeed = null
    variables.cookies.pointedCode = [3]
    variables.cookies.missingFeed = null
    variables.cookies.reworkFeed = null
    variables.cookies.pointedCodeDescription = [`Ini Prod.`]
    variables.cookies.motives = null
    variables.cookies.tempoDecorrido = null

    if (!variables.body) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [7])

    if (!resultVerifyCodeNote.accepted) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    if (resultVerifyCodeNote.accepted) {
        const resource = await selectQuery(10, variables.body)
        if (resource.data) {
            const insertPointCode = await insertInto(variables.cookies)
            if (insertPointCode) {
                return res.status(200).json({ status: message(1), message: message(1), data: message(33) })
            } else {
                return res.json({ status: message(1), message: message(21), data: message(33) })
            }
        } else {
            return res.json({ status: message(1), message: message(21), data: message(33) })
        }
    } else {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }
}