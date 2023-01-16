import { inicializer } from '../services/variableInicializer';
import { verifyCodeNote } from '../services/verifyCodeNote';
import { insertInto } from '../services/insert';
import { selectQuery } from '../services/query';
import { message } from '../services/message';
import { RequestHandler } from 'express';
import { cookieCleaner } from '../utils/clearCookie';
// var rip = `
//     SELECT DISTINCT
//     PROCESSO.NUMPEC,
//     PROCESSO.REVISAO,
//     QA_CARACTERISTICA.NUMCAR AS NUMCAR,
//     QA_CARACTERISTICA.CST_NUMOPE AS CST_NUMOPE,
//     QA_CARACTERISTICA.DESCRICAO,
//     ESPECIFICACAO  AS ESPECIF,
//     LIE,
//     LSE,
//     QA_CARACTERISTICA.INSTRUMENTO
//     FROM PROCESSO
//     INNER JOIN CLIENTES ON PROCESSO.RESUCLI = CLIENTES.CODIGO
//     INNER JOIN QA_CARACTERISTICA ON QA_CARACTERISTICA.NUMPEC=PROCESSO.NUMPEC
//     AND QA_CARACTERISTICA.REV_QA=PROCESSO.REV_QA 
//     AND QA_CARACTERISTICA.REVISAO = PROCESSO.REVISAO 
//     LEFT JOIN (SELECT OP.MAQUIN, OP.NUMPEC, OP.RECNO_PROCESSO, LTRIM(NUMOPE) AS CST_SEQUENCIA  
//     FROM OPERACAO OP (NOLOCK)) AS TBL ON TBL.RECNO_PROCESSO = PROCESSO.R_E_C_N_O_  AND TBL.MAQUIN = QA_CARACTERISTICA.CST_NUMOPE
//     WHERE PROCESSO.NUMPEC = '${partCode}' 
//     AND PROCESSO.REVISAO = '${revision}' 
//     AND CST_NUMOPE = '${machineCode}'
//     AND NUMCAR < '2999'
//     ORDER BY NUMPEC ASC`

export const rip: RequestHandler = async (req, res) => {
    const variables = await inicializer(req)

    if (!variables.cookies) {
        return res.json({ status: message(1), message: message(0), data: message(0), code: message(33) })
    }

    const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [4])

    if(resultVerifyCodeNote.message === message(0)){
        return res.json({ status: message(1), message: message(0), data: message(0), code: message(33) })
    }

    const oldTimer = new Date(resultVerifyCodeNote.time).getTime()
    const timeSpendStartRip = Number(new Date().getTime() - oldTimer) || null
    variables.cookies.goodFeed = null
    variables.cookies.badFeed = null
    variables.cookies.pointedCode = [5]
    variables.cookies.missingFeed = null
    variables.cookies.reworkFeed = null
    variables.cookies.pointedCodeDescription = [`Rip Ini.`]
    variables.cookies.motives = null
    variables.cookies.tempoDecorrido = timeSpendStartRip

    // Select to see if there any children
    const ripDetails = await selectQuery( 14, variables.cookies)
    console.log('ripDetails', ripDetails);

    if (ripDetails.data.length > 0) {
        // In case there is response from select
        let arrayNumope = ripDetails.data.map((acc: { CST_NUMOPE: string; }) => {
            if (acc.CST_NUMOPE === variables.cookies.CODIGO_MAQUINA) {
                return acc
            } else {
                return acc
            }
        })

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
        console.log('insert into 5');
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

    // else {
    //     const insertedPointCode = await insertInto(variables.cookies)

    //     if (!insertedPointCode) {
    //         return res.json({ status: message(1), message: message(33), data: message(33), code: message(33)})
    //     } else {
    //         return res.json({ status: message(1), message: message(42), data: message(42), code: resultVerifyCodeNote.code})
    //     }
    // }


    // if (resultVerifyCodeNote.accepted) {
    // } else {
    //     const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [5])
    //     if (resultVerifyCodeNote.accepted) {

    //     }
    // }




    // if (resultVerifyCodeNote.accepted) {
    //     // If there are no response from select
    //     if (ripDetails.data.length <= 0) {
    //         console.log('insert into 5');
    //         if (!insertedPointCode) {
    //         } else {
    //             return res.json({ status: message(1), message: message(33), data: message(33) })
    //         }
    //     }
    // } else {
    //     const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [5])

    //     if (ripDetails.data.length <= 0) {
    //         return res.json({ status: message(1), message: message(1), data: message(33) })
    //     }
    //     // In case there is response from select
    //     let arrayNumope = ripDetails.data.map((acc: { CST_NUMOPE: string; }) => {
    //         if (acc.CST_NUMOPE === variables.cookies.CODIGO_MAQUINA) {
    //             return acc
    //         } else {
    //             return acc
    //         }
    //     })

    //     // Set cookies to point later
    //     const numopeFilter = arrayNumope.filter((acc: any) => acc)
    //     res.cookie('cstNumope', numopeFilter.map((acc: { CST_NUMOPE: string; }) => acc.CST_NUMOPE))
    //     res.cookie('numCar', numopeFilter.map((acc: { NUMCAR: any; }) => acc.NUMCAR))
    //     res.cookie('descricao', numopeFilter.map((acc: { DESCRICAO: any; }) => acc.DESCRICAO))
    //     res.cookie('especif', numopeFilter.map((acc: { ESPECIF: any; }) => acc.ESPECIF))
    //     res.cookie('instrumento', numopeFilter.map((acc: { INSTRUMENTO: any; }) => acc.INSTRUMENTO))
    //     res.cookie('lie', numopeFilter.map((acc: { LIE: any; }) => acc.LIE))
    //     res.cookie('lse', numopeFilter.map((acc: { LSE: any; }) => acc.LSE))

    //     if (resultVerifyCodeNote.accepted) {
    //         console.log('insert into 5');
    //         const inserted = await insertInto(variables.cookies)
    //         if (inserted) {
    //             return res.json(numopeFilter)
    //         } else {
    //             return res.json({ status: message(1), message: message(33), data: message(33) })
    //         }
    //     } else {
    //         const resultVerifyCodeNote = await verifyCodeNote(variables.cookies, [5])
    //         if (resultVerifyCodeNote.accepted) {
    //             return res.json({ status: message(1), message: message(1), data: numopeFilter })
    //         } else {
    //             return res.json({ status: message(1), message: message(0), data: message(33) })
    //         }
    //     }
    // }
}