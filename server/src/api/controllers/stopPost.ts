import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { insertInto } from '../services/insert';
import { message } from '../services/message';
import { RequestHandler } from 'express';

export const stopPost: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    // var pointedCode = await codeNote(variables.cookies)
    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [message(20)])
    const end = new Date().getTime() || 0;
    const timeSpend = Number(end - resultVerifyCodeNote.time!) || 0
    variables.cookies.goodFeed = null
    variables.cookies.badFeed = null
    variables.cookies.pointedCode = [7]
    variables.cookies.missingFeed = null
    variables.cookies.reworkFeed = null
    variables.cookies.pointedCodeDescription = ['Parada']
    variables.cookies.motives = null
    variables.cookies.tempoDecorrido = timeSpend

    if (resultVerifyCodeNote.accepted) {
        return res.json({ status: message(1), message: message(19), data: message(33) })
    } else {
        //Insere O CODAPONTA 7 de parada de máquina
        const resour = await insertInto(variables.cookies)
        if (resour) {
            return res.status(200).json({ status: message(1), message: message(1), data: message(33) })
        } else if (!resour) {
            return res.json({ status: message(1), message: message(0), data: message(33) })
        } else {
            return res.json({ status: message(1), message: message(0), data: message(33) })
        }
    }
}