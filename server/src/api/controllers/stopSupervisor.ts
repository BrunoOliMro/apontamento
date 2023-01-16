import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { insertInto } from '../services/insert';
import { message } from '../services/message';
import { select } from '../services/select';
import { RequestHandler } from 'express';

export const stopSupervisor: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    // const resultVerifyCodeNote = await ver
    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [7])
    variables.cookies.goodFeed = null
    variables.cookies.badFeed = null
    variables.cookies.pointedCode = [3]
    variables.cookies.missingFeed = null
    variables.cookies.reworkFeed = null
    variables.cookies.pointedCodeDescription = [`Ini Prod.`]
    variables.cookies.motives = null
    variables.cookies.tempoDecorrido = null

    if (resultVerifyCodeNote.accepted) {
        const resource = await select(10, variables.body.superMaqPar)
        if (resource) {
            const insertPointCode = await insertInto(variables.cookies)
            if (insertPointCode) {
                return res.status(200).json({ status: message(1), message: message(1), data: message(33) })
            } else {
                return res.json({ status: message(1), message: message(21), data: message(33) })
            }
        } else if (!resource) {
            return res.json({ status: message(1), message: message(21), data: message(33) })
        } else {
            return res.json({ status: message(1), message: message(21), data: message(33) })
        }
    } else {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }
}