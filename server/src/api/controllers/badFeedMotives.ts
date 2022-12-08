import { RequestHandler } from "express";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const badFeedMotives: RequestHandler = async (req, res) => {
    let y = `SELECT R_E_C_N_O_, DESCRICAO FROM CST_MOTIVO_REFUGO (NOLOCK) ORDER BY DESCRICAO ASC`
    let odfNumber = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    let operationNumber = decrypted(String(sanitize(req.cookies['NUMERO_OPERACAO']))) || null
    const codeMachine = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    try {
        const x = await codeNote(odfNumber, operationNumber, codeMachine)
        if (x === 'Ini Prod' || x === 'Pointed' || x === 'Rip iniciated' || x === 'Machine has stopped') {
            let resource = await select(y)
            let resoc = resource.map((e: any) => e.DESCRICAO)
            if (resource.length > 0) {
                return res.status(200).json(resoc)
            } else {
                return res.json({ message: 'erro em motivos do refugo' })
            }
        } else {
            return res.json({ message: x })
        }
    } catch (error) {
        console.log(error)
        return res.json({ message: 'erro em motivos de refugo' })
    }
}