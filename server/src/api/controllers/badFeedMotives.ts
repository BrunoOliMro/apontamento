import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { RequestHandler } from 'express';

// var motivesString = `SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`
export const badFeedMotives: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables) {
        return res.json({ status: message(1), message: message(0), data: message(33) })
    }

    const pointedCode = await verifyCodeNote(variables.cookies, [3, 4, 5, 7])

    if (pointedCode.accepted) {
        const resultMotives = await selectQuery(1)
        return res.status(200).json({ status: message(1), message: message(1), data: resultMotives })
    } else {
        return res.status(400).json({ status: message(1), message: message(0), data: message(33) })
    }
}