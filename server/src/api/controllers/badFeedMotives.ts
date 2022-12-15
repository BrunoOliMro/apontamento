import { RequestHandler } from "express";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const badFeedMotives: RequestHandler = async (req, res) => {
    try {
        var y = `SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`
        var odfNumber = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
        var operationNumber = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
        var codeMachine = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
        var employee = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    } catch (error) {
        console.log('Error on BadFeedMotives --cookies--', error);
        return res.json({ message: 'Algo deu errado' })
    }
    try {
        const pointedCode = await codeNote(odfNumber, operationNumber, codeMachine, employee)
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const resource = await select(y)
            const resoc = resource.map((e: any) => e.DESCRICAO)
            if (resource.length > 0) {
                return res.status(200).json(resoc)
            } else {
                return res.json({ message: 'erro em motivos do refugo' })
            }
        } else {
            return res.json({ message: pointedCode.message })
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'erro em motivos de refugo' })
    }
}