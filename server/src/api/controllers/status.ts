import { RequestHandler } from "express";
import { select } from "../services/select";
import { codeNote } from "../utils/codeNote";
import { decrypted } from "../utils/decryptedOdf";
import { sanitize } from "../utils/sanitize";

export const status: RequestHandler = async (req, res) => {
    const numpec = decrypted(String(sanitize(req.cookies['CODIGO_PECA']))) || null
    const codeMachine = decrypted(String(sanitize(req.cookies['CODIGO_MAQUINA']))) || null
    const operationNumber = decrypted(sanitize(req.cookies['NUMERO_OPERACAO']))
    const odfNumber = decrypted(String(sanitize(req.cookies["NUMERO_ODF"]))) || null
    const revisao = decrypted(sanitize(req.cookies['REVISAO'])) || null
    const employee = decrypted(String(sanitize(req.cookies['FUNCIONARIO']))) || null
    const lookForTimer = `SELECT TOP 1 EXECUT FROM OPERACAO WHERE 1 = 1 AND NUMPEC = '${numpec}' AND NUMOPE = ${operationNumber} AND MAQUIN = '${codeMachine}' AND REVISAO = ${revisao} ORDER BY REVISAO DESC`
    let response = {
        message: '',
        temporestante: 0,
    }
    try {

        const x = await codeNote(odfNumber, operationNumber, codeMachine, employee)
        if (x.message === 'Ini Prod' || x.message === 'Pointed' || x.message === 'Rip iniciated' || x.message === 'Machine has stopped') {
            const resource = await select(lookForTimer)
            let tempoRestante = Number(resource[0].EXECUT * Number(decrypted(sanitize(String(req.cookies["QTDE_LIB"])))) * 1000 - (Number(new Date().getTime() - decrypted(String(sanitize(req.cookies['startSetupTime'])))))) || 0
            if (tempoRestante > 0) {
                response.temporestante = tempoRestante
                return res.status(200).json(response)
            } else if (tempoRestante <= 0) {
                tempoRestante = 0
                return res.json({ message: 'time for execution not found' })
            } else {
                return res.json({ message: 'Algo deu errado' })
            }
        } else {
            return res.json({ message: x })
        }
    } catch (error) {
        console.log('linha 29 - Status.ts -', error)
        return res.json({ error: true, message: "Erro no servidor." });
    }
}