import { RequestHandler } from 'express';
import { select } from '../services/select';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { sanitize } from '../utils/sanitize';

export const status: RequestHandler = async (req, res) => {
    const errorObj = {
        generalError: 'Algo deu errado',
    }
    try {
        var partCode = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
        var codeMachine = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
        var operationNumber = Number(decrypted(sanitize(req.cookies['NUMERO_OPERACAO']))!.replaceAll(' ', '')) || null
        var odfNumber = decrypted(String(sanitize(req.cookies['NUMERO_ODF']))) || null
        var revision = decrypted(sanitize(req.cookies['REVISAO'])) || null
        var employee = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
        var quantityReleased = Number(decrypted(sanitize(String(req.cookies['QTDE_LIB'])))) || null
        // var startSetupTime = decrypted(String(sanitize(req.cookies['startSetupTime']))) || null
        var stringLookForTimer = `SELECT TOP 1 EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${partCode}' AND NUMOPE = ${operationNumber} AND MAQUIN = '${codeMachine}' AND REVISAO = ${revision} ORDER BY REVISAO DESC`
        var response = {
            message: '',
            temporestante: 0,
        }
    } catch (error) {
        console.log('Error on Status.ts --cookies--', error);
        return res.json({ message: '' })
    }
    try {
        const pointedCode = await codeNote(odfNumber, operationNumber, codeMachine, employee)
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const lookForTimer = await select(stringLookForTimer)
            let timeLeft = Number(lookForTimer[0].EXECUT * quantityReleased! * 1000 - (Number(new Date().getTime() - pointedCode.time))) || 0
            if (timeLeft > 0) {
                response.temporestante = timeLeft
                return res.status(200).json(response)
            } else if (timeLeft <= 0) {
                timeLeft = 0
                return res.json({ message: '' })
            } else {
                return res.json({ message: errorObj.generalError })
            }
        } else {
            return res.json({ message: pointedCode })
        }
    } catch (error) {
        console.log('linha 42 - Status.ts -', error)
        return res.json({ message: errorObj.generalError });
    }
}