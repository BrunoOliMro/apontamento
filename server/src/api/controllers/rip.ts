import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
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

    if (ripDetails!.length > 0) {
        res.cookie('cstNumope', ripDetails.map((acc: { CST_NUMOPE: string; }) => acc.CST_NUMOPE))
        res.cookie('numCar', ripDetails.map((acc: { NUMCAR: any; }) => acc.NUMCAR))
        res.cookie('descricao', ripDetails.map((acc: { DESCRICAO: any; }) => acc.DESCRICAO))
        res.cookie('especif', ripDetails.map((acc: { ESPECIF: any; }) => acc.ESPECIF))
        res.cookie('instrumento', ripDetails.map((acc: { INSTRUMENTO: any; }) => acc.INSTRUMENTO))
        res.cookie('lie', ripDetails.map((acc: { LIE: any; }) => acc.LIE))
        res.cookie('lse', ripDetails.map((acc: { LSE: any; }) => acc.LSE))
    }

    if (resultVerifyCodeNote.accepted) {
        const insertedPointCode = await insertInto(variables.cookies)
        const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [5])
        if (!insertedPointCode) {
            return res.json({ status: message(1), message: message(33), data: message(33), code: message(33) })
        } else {
            return res.json({ status: message(1), message: message(1), data: ripDetails, code: resultVerifyCodeNote.code })
        }
    } else {
        const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [5])
        if(resultVerifyCodeNote.accepted){
            return res.json({ status: message(1), message: message(1), data: ripDetails, code: resultVerifyCodeNote.code })
        } else {
            return res.json({ status: message(1), message: message(1), data: message(33), code: resultVerifyCodeNote.code  })
        }
    }
}