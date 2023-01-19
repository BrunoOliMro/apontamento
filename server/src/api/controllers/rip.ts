import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { cookieCleaner } from '../utils/clearCookie';
import { insertInto } from '../services/insert';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { RequestHandler } from 'express';

export const rip: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables.cookies) {
        return res.json({ status: message(1), message: message(0), data: message(0), code: message(33) })
    }

    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [4])

    if(resultVerifyCodeNote.accepted){
        return res.json({ status: message(1), message: message(0), data: message(0), code: message(33) })
    }

    const oldTimer = new Date(resultVerifyCodeNote.time).getTime()
    const timeSpendStartRip = Number(new Date().getTime() - oldTimer) || null
    variables.cookies.tempoDecorrido = timeSpendStartRip
    variables.cookies.pointedCodeDescription = [`Rip Ini.`]
    variables.cookies.missingFeed = null
    variables.cookies.pointedCode = [5]
    variables.cookies.reworkFeed = null
    variables.cookies.goodFeed = null
    variables.cookies.badFeed = null
    variables.cookies.motives = null

    // Select to see if there any children
    const ripDetails: any = await selectQuery( 14, variables.cookies)

    if (ripDetails.data!.length > 0) {
        // In case there is response from select
        const arrayNumope = ripDetails.data!.map((acc: { CST_NUMOPE: string; }) => {

            if (acc.CST_NUMOPE === variables.cookies.CODIGO_MAQUINA) {
                return acc
            }

        })

        console.log('arrayNumope', arrayNumope);

        // Set cookies to point later
        const numopeFilter = arrayNumope.filter((acc: any) => acc)
        res.cookie('cstNumope', numopeFilter.map((acc: { CST_NUMOPE: string; }) => acc.CST_NUMOPE))
        res.cookie('numCar', numopeFilter.map((acc: { NUMCAR: any; }) => acc.NUMCAR))
        res.cookie('descricao', numopeFilter.map((acc: { DESCRICAO: any; }) => acc.DESCRICAO))
        res.cookie('especif', numopeFilter.map((acc: { ESPECIF: any; }) => acc.ESPECIF))
        res.cookie('instrumento', numopeFilter.map((acc: { INSTRUMENTO: any; }) => acc.INSTRUMENTO))
        res.cookie('lie', numopeFilter.map((acc: { LIE: any; }) => acc.LIE))
        res.cookie('lse', numopeFilter.map((acc: { LSE: any; }) => acc.LSE))
    }

    if (resultVerifyCodeNote.accepted) {
        const insertedPointCode = await insertInto(variables.cookies)
        const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [5])
        if (!insertedPointCode) {
            return res.json({ status: message(1), message: message(33), data: message(33), code: message(33) })
        } else {
            return res.json({ status: message(1), message: message(1), data: ripDetails.data, code: resultVerifyCodeNote.code })
        }
    } else {
        const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [5])
        if(resultVerifyCodeNote.accepted){
            return res.json({ status: message(1), message: message(1), data: ripDetails.data, code: resultVerifyCodeNote.code })
        } else {
            await cookieCleaner(res)
            return res.json({ status: message(1), message: message(1), data: message(33), code: resultVerifyCodeNote.code  })
        }
    }
}