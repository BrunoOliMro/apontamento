import { RequestHandler } from 'express';
import { select } from '../services/select';
import { codeNote } from '../utils/codeNote';
import { decrypted } from '../utils/decryptedOdf';
import { sanitize } from '../utils/sanitize';

export const badFeedMotives: RequestHandler = async (req, res) => {
    try {
        var odfNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_ODF'])))) || null
        var operationNumber = Number(decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO'])))) || null
        var machineCode = String(decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA'])))) || null
        var employee = String(decrypted(String(sanitize(req.cookies['FUNCIONARIO'])))) || null
        var motivesString = `SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`
    } catch (error) {
        console.log('Error on BadFeedMotives --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }
    try {
        const pointedCode = await codeNote(odfNumber, operationNumber, machineCode, employee)
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const resultMotives = await select(motivesString)
            const resultMap = resultMotives.map((e: any) => e.DESCRICAO)
            if (resultMotives.length > 0) {
                return res.status(200).json(resultMap)
            } else {
                return res.json({ message: 'Algo deu errado' })
            }
        } else {
            return res.json({ message: pointedCode.message })
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'Algo deu errado' })
    }
}