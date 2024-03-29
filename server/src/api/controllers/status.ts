import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { RequestHandler } from 'express';

export const status: RequestHandler = async (req, res) => {
    var t0 = performance.now()
    const variables = await inicializer(req)

    if (!variables.cookies) {
        return res.json({ status: message(1), message: message(0), data: message(0), supervisor: message(33) })
    }

    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [3, 4, 5, 7])

    if (resultVerifyCodeNote.accepted) {
        const lookForTimer = await selectQuery(25, variables.cookies)
        let timeLeft
        var t1 = performance.now()
        console.log('Status.ts', t1- t0);
        if(lookForTimer){
            timeLeft = Number(lookForTimer[0].EXECUT * variables.cookies.QTDE_LIB! * 1000 - (Number(new Date().getTime() - resultVerifyCodeNote.time))) || 0
        } else {
            timeLeft = 6000;
        }
        return res.json({ status: message(1), message: message(1), data: timeLeft, supervisor: variables.cookies.supervisor })
    } else {
        return res.json({ status: message(1), message: message(33), data: message(33) })
    }
}