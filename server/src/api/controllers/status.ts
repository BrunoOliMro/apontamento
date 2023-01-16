import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { RequestHandler } from 'express';

// var stringLookForTimer = `SELECT TOP 1 EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${partCode}' AND NUMOPE = ${operationNumber} AND MAQUIN = '${codeMachine}' AND REVISAO = ${revision} ORDER BY REVISAO DESC`
// if (timeLeft > 0) {
//     response.temporestante = timeLeft
//     return res.status(200).json(response)
// } else if (timeLeft <= 0) {
//     timeLeft = 0
//     return res.json({ message: message(33) })
// } else {
//     return res.json({ message: message(0) })
// }

export const status: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables.cookies) {
        return res.json({ status: message(1), message: message(0), data: message(0) })
    }

    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [3, 4, 5, 7])

    // console.log('Status.ts', resultVerifyCodeNote);

    if (resultVerifyCodeNote.accepted) {
        const lookForTimer = await selectQuery(25, variables.cookies)
        console.log('lookForTimer', lookForTimer);
        let timeLeft
        if(lookForTimer.data){
            timeLeft = Number(lookForTimer.data[0].EXECUT * variables.cookies.QTDE_LIB! * 1000 - (Number(new Date().getTime() - resultVerifyCodeNote.time))) || 0
        } else {
            timeLeft = 6000;
        }
        return res.json({ status: message(1), message: message(1), data: timeLeft })
    } else {
        return res.json({ status: message(1), message: message(33), data: message(33) })
    }
}