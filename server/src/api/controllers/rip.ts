import { RequestHandler } from 'express';
import { insertInto } from '../services/insert';
import { select } from '../services/select';
import { codeNote } from '../utils/codeNote';
//import { cookieGenerator } from '../utils/cookieGenerator';
//import { cookieGenerator } from '../utils/cookieGenerator';
import { decrypted } from '../utils/decryptedOdf';
// import { encrypted } from '../utils/encryptOdf';
import { sanitize } from '../utils/sanitize';
//import { encrypted } from '../utils/encryptOdf';

export const rip: RequestHandler = async (req, res) => {
    try {
        var revision = String(decrypted(String(sanitize(req.cookies['REVISAO'])))) || null
        var machineCode = String(decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA'])))) || null
        var partCode = String(decrypted(String(sanitize(req.cookies['CODIGO_PECA'])))) || null
        var odfNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var operationNumber = String(decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))))!.replaceAll(' ', '') || null
        var funcionario = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        // var start = Number(decrypted(String(sanitize(req.cookies['startSetupTime'])))) || null
        var maxQuantityReleased = Number(decrypted(String(sanitize(req.cookies['QTDE_LIB'])))) || null
        // res.cookie('startRip', encrypted(String(new Date().getDate())));
        var descricaoCodAponta = [`Rip Ini.`]
        var boas = null
        var ruins = null
        var faltante = null
        var retrabalhada = null
        var codAponta = [5]
        var motivo = null
        // var startTime = Number(new Date(start!).getTime()) || null
        var response = {
            message: '',
            object: '',
        }
        var rip = `
            SELECT  DISTINCT
            PROCESSO.NUMPEC,
            PROCESSO.REVISAO,
            QA_CARACTERISTICA.NUMCAR AS NUMCAR,
            QA_CARACTERISTICA.CST_NUMOPE AS CST_NUMOPE,
            QA_CARACTERISTICA.DESCRICAO,
            ESPECIFICACAO  AS ESPECIF,
            LIE,
            LSE,
            QA_CARACTERISTICA.INSTRUMENTO
            FROM PROCESSO
            INNER JOIN CLIENTES ON PROCESSO.RESUCLI = CLIENTES.CODIGO
            INNER JOIN QA_CARACTERISTICA ON QA_CARACTERISTICA.NUMPEC=PROCESSO.NUMPEC
            AND QA_CARACTERISTICA.REV_QA=PROCESSO.REV_QA 
            AND QA_CARACTERISTICA.REVISAO = PROCESSO.REVISAO 
            LEFT JOIN (SELECT OP.MAQUIN, OP.NUMPEC, OP.RECNO_PROCESSO, LTRIM(NUMOPE) AS CST_SEQUENCIA  
            FROM OPERACAO OP (NOLOCK)) AS TBL ON TBL.RECNO_PROCESSO = PROCESSO.R_E_C_N_O_  AND TBL.MAQUIN = QA_CARACTERISTICA.CST_NUMOPE
            WHERE PROCESSO.NUMPEC = '${partCode}' 
            AND PROCESSO.REVISAO = '${revision}' 
            AND CST_NUMOPE = '${machineCode}'
            AND NUMCAR < '2999'
            ORDER BY NUMPEC ASC`

        var pointedCode = await codeNote(odfNumber, Number(operationNumber), machineCode, funcionario)
        var oldTimer = new Date(pointedCode.time).getTime()
        var ripStartTime = Number(new Date().getTime() - oldTimer) || null
    } catch (error) {
        console.log('Error on Rip --cookies--', error);
        return res.json({ message: '' })
    }

    // Select to see if there any children
    try {
        var ripDetails = await select(rip)
    } catch (error) {
        console.log('Error on Rip Select', error);
        return res.json({ message: '' })
    }

    // If there are no response from select
    if (ripDetails.length <= 0) {
        response.message = 'Não há rip a mostrar'
        const insertedPointCode = await insertInto(funcionario, odfNumber, partCode, revision, operationNumber, machineCode, maxQuantityReleased, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, ripStartTime)
        console.log('response', response);
        if (insertedPointCode) {
            return res.json(response)
        } else {
            return res.json({ message: '' })
        }
    }

    // In case there is response from select
    let arrayNumope = ripDetails.map((acc: { CST_NUMOPE: string; }) => {
        if (acc.CST_NUMOPE === machineCode) {
            return acc
        } else {
            return acc
        }
    })

    // Set cookies to point later
    let numopeFilter = arrayNumope.filter((acc: any) => acc)
    res.cookie('cstNumope', numopeFilter.map((acc: { CST_NUMOPE: string; }) => acc.CST_NUMOPE))
    res.cookie('numCar', numopeFilter.map((acc: { NUMCAR: any; }) => acc.NUMCAR))
    res.cookie('descricao', numopeFilter.map((acc: { DESCRICAO: any; }) => acc.DESCRICAO))
    res.cookie('especif', numopeFilter.map((acc: { ESPECIF: any; }) => acc.ESPECIF))
    res.cookie('instrumento', numopeFilter.map((acc: { INSTRUMENTO: any; }) => acc.INSTRUMENTO))
    res.cookie('lie', numopeFilter.map((acc: { LIE: any; }) => acc.LIE))
    res.cookie('lse', numopeFilter.map((acc: { LSE: any; }) => acc.LSE))

    try {
        // Codigo de apontamento on last point
        if (pointedCode.message === 'Pointed') {
            try {
                const inserted = await insertInto(funcionario, odfNumber, partCode, revision, operationNumber!.replaceAll(' ', ''), machineCode, maxQuantityReleased, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, ripStartTime)
                if (inserted) {
                    return res.json(numopeFilter)
                } else {
                    return response.message = ''
                }
            } catch (error) {
                console.log('Error on rip.ts', error);
                return response.message = ''
            }
        } else if (pointedCode.message === 'Rip iniciated') {
            return res.json(numopeFilter)
        } else {
            return res.json({ message: pointedCode.message })
        }
    } catch (error) {
        response.message = 'Erro ao iniciar tempo da rip'
        return res.json(response)
    }
}